import CreatableSelect from 'react-select/creatable';
import { MultiValue, ActionMeta } from 'react-select';
import api from "../../service/apiClient";
import { useEffect, useState } from 'react';

type TagOption = { value: string; label: string };

interface TagInputProps {
    selectedTags: TagOption[];
    setSelectedTags: React.Dispatch<React.SetStateAction<TagOption[]>>;
}

const TagInput = ({ selectedTags, setSelectedTags }: TagInputProps) => {
    const [options, setOptions] = useState([
        { value: "vegan", label: "Vegan" }
    ]);
    
    

    useEffect(() => {
        api.get('/tags').then(response => {
            const tagOptions = response.data.map((tag: Tag) => ({
                value: tag.name,
                label: tag.name
            }));
            setOptions(tagOptions);
        }).catch(error => {
            console.error('Error fetching tags:', error);
        });
    }, []);

    const handleTagChange = (
        newValue: MultiValue<{ value: string; label: string }>,
        _actionMeta: ActionMeta<{ value: string; label: string }>
    ) => {
        setSelectedTags([...newValue]);
    };

    const handleCreateTag = (inputValue: string) => {
    const newTag = { value: inputValue.toLowerCase(), label: inputValue };
    setOptions((prev) => [...prev, newTag]);
    setSelectedTags((prev) => [...prev, newTag]);
  };

    return (
        <div>
            <label htmlFor="tags">Tags:</label>
                    <CreatableSelect
                        isMulti
                        options={options}
                        value={selectedTags}
                    onChange={handleTagChange}
                    onCreateOption={handleCreateTag}
                    placeholder="Choose or add tags..."
                    />
        </div>
    );
};

export default TagInput;