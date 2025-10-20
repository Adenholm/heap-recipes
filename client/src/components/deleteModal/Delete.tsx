import { useContext } from "react";
import { ModalContext } from "../../context/modal";
import { useRecipes } from "../../context/recipes";
import { useNavigate } from "react-router-dom";
import './style.css';

const DeleteModal = ({ recipeId }: { recipeId: number }) => {
    const { closeModal } = useContext(ModalContext);
    const { deleteRecipe } = useRecipes();
    const navigate = useNavigate();

    const handleDelete = () => {
        deleteRecipe(recipeId);
        closeModal();
        navigate('/');
    };

    return (
        <div>
            <p>Are you sure you want to delete this recipe?</p>
            <div className="modal-buttons">
                <button onClick={closeModal}>Cancel</button>
                <button onClick={handleDelete}>Delete</button>
            </div>
        </div>
    );
}

export default DeleteModal;