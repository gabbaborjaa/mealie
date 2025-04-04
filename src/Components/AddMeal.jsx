import React from "react";

const AddMeal = ({ showModal, setShowModal, newMeal, setNewMeal, addMeal, days }) => {
    if (!showModal) return null;

    return (
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
    );
};

export default AddMeal;
