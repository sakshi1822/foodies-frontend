import React, { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({category, searchText}) => {



  const { foodList } = useContext(StoreContext);
  const filteredFoodList = foodList.filter(food => (
     (category === 'All' || food.category === category) &&
     (food.name.toLowerCase().includes(searchText.toLowerCase()))
    
  ));
  return (
    <div className="container">
      <div className="row">
        {filteredFoodList.length > 0 ? (
          
          filteredFoodList.map((food, index) => (
            <FoodItem key={index} 
            name={food.name} 
            description={food.description} 
            id={food.id} 
            price={food.price} 
            imageUrl={food.imageUrl}/>
          ))
        ) : (
          <div className="text-center mt-4">
            <h4>No Food Items </h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDisplay;
