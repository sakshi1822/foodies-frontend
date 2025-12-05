import React, { useContext } from "react";
import "./PlaceOrder.css";
import assets from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { calculateCartTotals } from "../../util/CartUtils";
import { useState } from "react";
import { toast } from "react-toastify";
import { RAZORPAY_KEY } from "../../util/Constants";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// import Razorpay from "razorpay";

const PlaceOrder = () => {
  const { foodList, quantities, setQuantities, token } =
    useContext(StoreContext);
  const navigate = useNavigate();
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    city: "",

    zip: "",
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    console.log("data", data);
    const orderData = {
      address: `${data.firstName} ${data.lastName} ${data.address} ${data.city} ${data.state} ${data.zip}`,
      phone: data.phone,
      email: data.email,
      items: cartItems.map((item) => ({
        foodId: item.id,
        quantity: quantities[item.id],
      })),

      amount: total.toFixed(2),
      orderStatus: "preparing",
    };
    try {
      const response = await axios.post(
        "http://localhost:8080/api/orders/create",
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 201 && response.data.razorpayOrderId) {
        initiateRazorpayPayment(response.data);
      } else {
        toast.error("Unable to place order. Please try again..");
      }
    } catch (error) {
      toast.error("Unable to place order. Please try again");
      console.log(error);
    }
  };
  const initiateRazorpayPayment = (order) => {
    const options = {
      key: RAZORPAY_KEY,
      amount: order.amount,
      currency: "INR",
      name: "Food LAnd",
      description: "food order payment",
      order_id: order.razorpayOrderId,
      handler: async function (razorpayResponse) {
        await verifyPayment(razorpayResponse);
      },
      prefill: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        contact: data.phone,
      },
      theme: { color: "#3399cc" },
      modal: {
        ondismiss: async function () {
          toast.error("payment cancelled.");
          await deleteOrder(order.id);
        },
      },
    };
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };
  const verifyPayment = async (razorpayResponse) => {
    const paymentData = {
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_signature: razorpayResponse.razorpay_signature,
    };
    try {
      const response = await axios.post(
        "http://localhost:8080/api/orders/verify",
        paymentData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        toast.success("payment successful");
        await clearCart();
        navigate("/myorders");
        console.log("payment succesful");
      } else {
        toast.error("Payment Failed!!");
        navigate("/");
      }
    } catch (error) {
      toast.error("Payment Failed!!");
    }
  };
  const deleteOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:8080/api/orders/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      toast.error("Unable to delete");
      console.log(error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete("http://localhost:8080/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuantities({});
    } catch (error) {
      toast.error("Error while clearing the cart");
    }
  };

  const cartItems = foodList.filter((food) => quantities[food.id] > 0);
  const { subtotal, shipping, tax, total } = calculateCartTotals(
    cartItems,
    quantities
  );
  return (
    <div className="container mt-4">
      <main>
        <div className="py-5 text-center">
          <img
            className="d-block mx-auto"
            src={assets.logo}
            alt=""
            width="98"
            height="98"
          />
        </div>
        <div className="row g-5">
          <div className="col-md-5 col-lg-4 order-md-last">
            <h4 className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-primary">Your cart</span>
              <span className="badge bg-primary rounded-pill">
                {cartItems.length}
              </span>
            </h4>
            <ul className="list-group mb-3">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="list-group-item d-flex justify-content-between lh-sm"
                >
                  <div>
                    <h6 className="my-0">{item.name}</h6>
                    <small className="text-body-secondary">
                      Qty : {quantities[item.id]}
                    </small>
                  </div>
                  <span className="text-muted">
                    &#8377;{item.price * quantities[item.id]}
                  </span>
                </li>
              ))}
              <li className="list-group-item d-flex justify-content-between ">
                <div>
                  <span className="text-body-secondary">Shipping</span>
                </div>
                <span className="text-muted">
                  &#8377;{subtotal === 0 ? 0.0 : shipping.toFixed(2)}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between ">
                <div>
                  <span>Tax(10%)</span>
                </div>
                <span className="text-muted">&#8377;{tax.toFixed(2)}</span>
              </li>

              <li className="list-group-item d-flex justify-content-between">
                <span>Total (INR)</span>
                <strong>&#8377;{total.toFixed(2)}</strong>
              </li>
            </ul>
          </div>

          <div className="col-md-7 col-lg-8">
            <h4 className="mb-3">Billing address</h4>

            <form className="needs-validation" onSubmit={onSubmitHandler}>
              <div className="row g-3">
                <div className="col-sm-6">
                  <label htmlFor="firstName" className="form-label">
                    First name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="firstName"
                    placeholder="John"
                    required
                    name="firstName"
                    onChange={onChangeHandler}
                    value={data.firstName}
                  />
                </div>

                <div className="col-sm-6">
                  <label htmlFor="lastName" className="form-label">
                    Last name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="lastName"
                    placeholder="Doe"
                    required
                    name="lastName"
                    value={data.lastName}
                    onChange={onChangeHandler}
                  />
                </div>

                <div className="col-12">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <div className="input-group has-validation">
                    <span className="input-group-text">@</span>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Email"
                      required
                      name="email"
                      onChange={onChangeHandler}
                      value={data.email}
                    />
                  </div>
                </div>
                <div className="col-12">
                  <label htmlFor="phone" className="form-label">
                    Phone
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="phone"
                    placeholder="+91"
                    required
                    value={data.phone}
                    name="phone"
                    onChange={onChangeHandler}
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="address" className="form-label">
                    Address
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="address"
                    placeholder="1234 Main St"
                    required
                    name="address"
                    value={data.address}
                    onChange={onChangeHandler}
                  />
                </div>

                <div className="col-md-5">
                  <label htmlFor="state" className="form-label">
                    State
                  </label>
                  <select
                    className="form-select"
                    id="state"
                    required
                    name="state"
                    value={data.state}
                    onChange={onChangeHandler}
                  >
                    <option value="">Choose...</option>
                    <option>Maharashtra</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label htmlFor="city" className="form-label">
                    City
                  </label>
                  <select
                    className="form-select"
                    id="city"
                    required
                    name="city"
                    value={data.city}
                    onChange={onChangeHandler}
                  >
                    <option value="">Choose...</option>
                    <option>Pune</option>
                    <option>Mumbai</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label htmlFor="zip" className="form-label">
                    Zip
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="zip"
                    placeholder=""
                    required
                    name="zip"
                    value={data.zip}
                    onChange={onChangeHandler}
                  />
                </div>
              </div>

              <hr className="my-4" />

              <button
                className="w-100 btn btn-primary btn-lg"
                type="submit"
                disabled={cartItems.length === 0}
              >
                Continue to checkout
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlaceOrder;
