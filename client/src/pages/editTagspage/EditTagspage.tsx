import { use, useEffect, useState } from "react";
import api from "../../service/apiClient";
import './style.css';
import deleteIcon from '../../assets/images/delete-white.svg';


const EditTagsPage = () => {
    const [tags, setTags] = useState<Tag[]>([]);

    useEffect(() => {
        api.get('/tags')
            .then(response => {
                setTags(response.data);
            })
            .catch(error => {
                console.error('Error fetching tags:', error);
            });
    }, []);

    const handleTagChange = (id: number | undefined, newName: string) => {
        if (!id) return;
        const updatedTags = tags.map(tag =>
            tag.id === id ? { ...tag, name: newName } : tag
        );
        setTags(updatedTags);
        api.put(`/tags/${id}`, { name: newName })
            .then(() => {
                console.log('Tag updated successfully');
            })
            .catch(error => {
                console.error('Error updating tag:', error);
            });
    }

    const handleTagDelete = (id: number | undefined) => {
        if (!id) return;
        const updatedTags = tags.filter(tag => tag.id !== id);
        setTags(updatedTags);
        api.delete(`/tags/${id}`)
            .then(() => {
                console.log('Tag deleted successfully');
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
                {tags.map(tag => (
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