import React from "react";
import "./Contact.css";
import axios from "axios";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/contact`;
      const res = await axios.post(API_URL, formData);
      alert("Message sent!");
    } catch (err) {
      console.error("Contact form error:", err);
      alert("Failed to send message");
    }
  };

  return (
    <section className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="contact-form p-5 shadow-sm bg-white">
              <h2 className="text-center mb-4">Get in Touch</h2>
              <form>
                <div className="row g-3">
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control custom-input"
                      placeholder="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={onChangeHandler}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control custom-input"
                      placeholder="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={onChangeHandler}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <input
                      type="email"
                      className="form-control custom-input"
                      placeholder="Email Address"
                      name="email"
                      value={formData.email}
                      onChange={onChangeHandler}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <textarea
                      className="form-control custom-input"
                      rows="5"
                      placeholder="Your Message"
                      name="message"
                      value={formData.message}
                      onChange={onChangeHandler}
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <button
                      className="btn btn-primary w-100 py-3"
                      type="submit"
                      onClick={handleSubmit}
                      required
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
