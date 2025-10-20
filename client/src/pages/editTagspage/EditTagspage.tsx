import { use, useEffect, useState } from "react";
import api from "../../service/apiClient";
import './style.css';
// @ts-ignore: missing type declaration for SVG import
import deleteIcon from '../../assets/images/delete-white.svg';
import { useRecipes } from "../../context/recipes";


const EditTagsPage = () => {
    const { tags, fetchTags } = useRecipes();
    const [tagsData, setTags] = useState<Tag[]>([]);

    useEffect(() => {
        setTags(tags);
    }, [tags]);

    const handleTagChange = (id: number | undefined, newName: string) => {
        if (!id) return;
        const updatedTags = tagsData.map(tag =>
            tag.id === id ? { ...tag, name: newName } : tag
        );
        setTags(updatedTags);
        api.put(`/tags/${id}`, { name: newName })
            .then(() => {
                console.log('Tag updated successfully');
                fetchTags();
            })
            .catch(error => {
                console.error('Error updating tag:', error);
            });
    }

    const handleTagDelete = (id: number | undefined) => {
        if (!id) return;
        const updatedTags = tagsData.filter(tag => tag.id !== id);
        setTags(updatedTags);
        api.delete(`/tags/${id}`)
            .then(() => {
                console.log('Tag deleted successfully');
                fetchTags();
            })
            .catch(error => {
                console.error('Error deleting tag:', error);
            });
    }

    return (
        <div className="edit-tags container">
            <h1>Edit Tags</h1>
            <hr />
            <ul>
                {tagsData.map(tag => (
                    <li key={tag.id}>
                        <input
                            type="text"
                            value={tag.name}
                            onChange={e => handleTagChange(tag.id, e.target.value)}
                        />
                        <button onClick={() => handleTagDelete(tag.id)}>
                            <img src={deleteIcon} alt="Delete" />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default EditTagsPage;