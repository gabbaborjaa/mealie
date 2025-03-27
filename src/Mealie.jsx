import { useState, useEffect } from "react";
import './Mealie.css';

const Mealie = () => {
    const [meals, setMeals] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false); // Control the edit modal
    const [editMeal, setEditMeal] = useState(null); // Track the meal being edited
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

    const handleEditMeal = (meal, type, day) => {
        setEditMeal({ ...meal[type], type, day });
        setShowEditModal(true);
    };

    const saveMeal = () => {
        const updatedMeals = meals.map((meal) => {
            if (meal.day === editMeal.day) {
                return {
                    ...meal,
                    [editMeal.type]: {
                        name: editMeal.name,
                        protein: editMeal.protein,
                        carbs: editMeal.carbs,
                        sugars: editMeal.sugars,
                    },
                };
            }
            return meal;
        });
        setMeals(updatedMeals);
        setShowEditModal(false);
    };

    const deleteMeal = (day, type) => {
        const updatedMeals = meals.map((meal) => {
            if (meal.day === day) {
                return {
                    ...meal,
                    [type]: { name: "", protein: 0, carbs: 0, sugars: 0 },
                };
            }
            return meal;
        });
        setMeals(updatedMeals);
    };

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

    const currentDay = new Date().toLocaleString("en-US", { weekday: "long" });
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const mealTypes = ["Breakfast", "Lunch", "Dinner"];

    return (
        <div className="main-container">
            <h1 className="text-center mb-4">Mealie</h1>

            {/* Add Meal Button */}
            <div className="text-center mb-4">
                <button
                    className="btn btn-primary"
                    onClick={() => setShowModal(true)}
                >
                    Add Meal
                </button>
            </div>

            {/* Calendar Table */}
            <div className="calendar-table">
                <table className="table table-bordered table-hover text-center">
                    <thead>
                        <tr>
                            <th>Meal Type</th>
                            {days.map((day) => (
                                <th key={day}>{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {mealTypes.map((mealType) => (
                            <tr key={mealType}>
                                <td className="fw-bold text-capitalize">{mealType}</td>
                                {days.map((day) => {
                                    const meal = meals.find((m) => m.day === day) || {
                                        breakfast: { name: "", protein: 0, carbs: 0, sugars: 0 },
                                        lunch: { name: "", protein: 0, carbs: 0, sugars: 0 },
                                        dinner: { name: "", protein: 0, carbs: 0, sugars: 0 },
                                    };
                                    const mealData = meal[mealType.toLowerCase()];

                                    return (
                                        <td
                                            key={day}
                                            className={`meal-cell ${mealData.name ? "has-meal" : "no-meal"} ${
                                                day === currentDay ? "table-primary" : ""
                                            }`}
                                        >
                                            <strong>{mealData.name || "No meal"}</strong>
                                            {mealData.name && (
                                                <div className="nutrition-data mt-2">
                                                    <small>Protein: {mealData.protein}g</small>
                                                    <br />
                                                    <small>Carbs: {mealData.carbs}g</small>
                                                    <br />
                                                    <small>Sugars: {mealData.sugars}g</small>
                                                </div>
                                            )}
                                            <div className="mt-2">
                                                <button
                                                    className="update"
                                                    onClick={() => handleEditMeal(meal, mealType.toLowerCase(), day)}
                                                >
                                                    Update
                                                </button>
                                                <button
                                                    className="delete"
                                                    onClick={() => deleteMeal(day, mealType.toLowerCase())}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Meal Modal */}
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
                                            {days.map((day) => (
                                                <option key={day} value={day}>
                                                    {day}
                                                </option>
                                            ))}
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
                                    <button type="submit" className="btn btn-primary">
                                        Add Meal
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Meal Modal */}
            {showEditModal && editMeal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Meal</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowEditModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        saveMeal();
                                    }}
                                >
                                    <div className="mb-3">
                                        <label className="form-label">Meal Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editMeal.name}
                                            onChange={(e) =>
                                                setEditMeal({ ...editMeal, name: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Protein (g)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={editMeal.protein}
                                            onChange={(e) =>
                                                setEditMeal({ ...editMeal, protein: +e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Carbs (g)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={editMeal.carbs}
                                            onChange={(e) =>
                                                setEditMeal({ ...editMeal, carbs: +e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Sugars (g)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={editMeal.sugars}
                                            onChange={(e) =>
                                                setEditMeal({ ...editMeal, sugars: +e.target.value })
                                            }
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary">
                                        Save Changes
                                    </button>
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