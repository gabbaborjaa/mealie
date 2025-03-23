import React, { useState, useEffect } from "react";
import './Mealie.css';

const Mealie = () => {
    const [meals, setMeals] = useState([]);
    const [newMeal, setNewMeal] = useState({
        day: "",
        type: "breakfast", // Default to breakfast
        name: "",
        protein: 0,
        carbs: 0,
        sugars: 0,
    });
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Placeholder for fetching meals
        const fetchMeals = async () => {
            const mealList = [
                {
                    id: "1",
                    day: "Monday",
                    breakfast: { name: "Oatmeal", protein: 5, carbs: 27, sugars: 1 },
                    lunch: { name: "Chicken Salad", protein: 30, carbs: 10, sugars: 5 },
                    dinner: { name: "Steak", protein: 40, carbs: 0, sugars: 0 },
                },
            ];
            setMeals(mealList);
        };

        fetchMeals();
    }, []);

    const addMeal = () => {
        const existingMeal = meals.find((meal) => meal.day === newMeal.day);

        if (existingMeal) {
            // Update the existing meal for the selected day
            const updatedMeal = {
                ...existingMeal,
                [newMeal.type]: {
                    name: newMeal.name,
                    protein: newMeal.protein,
                    carbs: newMeal.carbs,
                    sugars: newMeal.sugars,
                },
            };
            setMeals(
                meals.map((meal) =>
                    meal.day === newMeal.day ? updatedMeal : meal
                )
            );
        } else {
            // Add a new meal entry for the selected day
            const newMealEntry = {
                id: Date.now().toString(),
                day: newMeal.day,
                breakfast: { name: "", protein: 0, carbs: 0, sugars: 0 },
                lunch: { name: "", protein: 0, carbs: 0, sugars: 0 },
                dinner: { name: "", protein: 0, carbs: 0, sugars: 0 },
                [newMeal.type]: {
                    name: newMeal.name,
                    protein: newMeal.protein,
                    carbs: newMeal.carbs,
                    sugars: newMeal.sugars,
                },
            };
            setMeals([...meals, newMealEntry]);
        }

        // Reset the form and close the modal
        setNewMeal({
            day: "",
            type: "breakfast",
            name: "",
            protein: 0,
            carbs: 0,
            sugars: 0,
        });
        setShowModal(false);
    };

    const deleteMeal = (id) => {
        const updatedMeals = meals.filter((meal) => meal.id !== id);
        setMeals(updatedMeals);
    };

    const currentDay = new Date().toLocaleString("en-US", { weekday: "long" });
    // Main App Container UI
    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Mealie</h1>
            {/* <button type="submit" className="btn btn-primary">Add Meal</button> */}
            <div class="button-container">
            <button
                className="btn btn-primary mt-4"
                onClick={() => setShowModal(true)}
            >
                Add Meal
            </button>
             </div>
            {/* Calendar View */}
            <div className="table-responsive">
                <table className="table table-bordered table-hover text-center">
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>Breakfast</th>
                            <th>Lunch</th>
                            <th>Dinner</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <thead> 
                        <tr>
                        <th> Monday </th>
                        <th> Tuesday </th>
                        <th> Wednesday </th>
                        <th> Thursday </th>
                        <th> Friday </th>
                        </tr>
                        
                    </thead> 
                    <tbody>
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                            const isToday = day === currentDay;
                            const meal = meals.find((m) => m.day === day) || {
                                breakfast: { name: "" },
                                lunch: { name: "" },
                                dinner: { name: "" },
                            };
                            return (
                                <tr key={day} className={isToday ? "table-primary" : ""}>
                                    <td className="fw-bold">{day}</td>
                                    <td className={meal.breakfast.name ? "" : "no-meal"}>
                                        {meal.breakfast.name || "No meal"}
                                    </td>
                                    <td className={meal.lunch.name ? "" : "no-meal"}>
                                        {meal.lunch.name || "No meal"}
                                    </td>
                                    <td className={meal.dinner.name ? "" : "no-meal"}>
                                        {meal.dinner.name || "No meal"}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => deleteMeal(meal.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Add Meal Button */}
            

            {/* Modal for Adding Meals */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add a New Meal</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        addMeal();
                                    }}
                                >
                                    <div className="mb-3">
                                        <label className="form-label">Day</label>
                                        <select
                                            className="form-control"
                                            value={newMeal.day}
                                            onChange={(e) =>
                                                setNewMeal({ ...newMeal, day: e.target.value })
                                            }
                                            required
                                        >
                                            <option value="">Select a day</option>
                                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                                                (day) => (
                                                    <option key={day} value={day}>
                                                        {day}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Meal Type</label>
                                        <select
                                            className="form-control"
                                            value={newMeal.type}
                                            onChange={(e) =>
                                                setNewMeal({ ...newMeal, type: e.target.value })
                                            }
                                            required
                                        >
                                            <option value="breakfast">Breakfast</option>
                                            <option value="lunch">Lunch</option>
                                            <option value="dinner">Dinner</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Meal Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Name"
                                            value={newMeal.name}
                                            onChange={(e) =>
                                                setNewMeal({ ...newMeal, name: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Protein (g)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={newMeal.protein}
                                            onChange={(e) =>
                                                setNewMeal({ ...newMeal, protein: +e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Carbs (g)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={newMeal.carbs}
                                            onChange={(e) =>
                                                setNewMeal({ ...newMeal, carbs: +e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Sugars (g)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={newMeal.sugars}
                                            onChange={(e) =>
                                                setNewMeal({ ...newMeal, sugars: +e.target.value })
                                            }
                                        />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Mealie;