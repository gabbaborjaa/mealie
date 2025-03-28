import React from "react";

const EditMeal = ({ showEditModal, setShowEditModal, editMeal, setEditMeal, saveMeal }) => {
    if (!showEditModal || !editMeal) return null;

    return (
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
    );
};

export default EditMeal;
