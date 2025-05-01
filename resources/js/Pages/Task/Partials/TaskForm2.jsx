import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Link } from "@inertiajs/react";
import Select from 'react-select';

export default function TaskForm2({
    data,
    setData,
    errors,
    onSubmit,
    users,
    categories,
}) {
    // Convert users and categories to react-select format
    const userOptions = users.data.map(user => ({
        value: user.id,
        label: user.name
    }));

    const categoryOptions = categories.map(category => ({
        value: category.id,
        label: category.name
    }));

    const priorityOptions = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
    ];

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' }
    ];

    // Custom styles for react-select
    const customStyles = {
        option: (provided, state) => ({
            ...provided,
            color: 'black',
            backgroundColor: state.isSelected ? '#4F46E5' : 'white',
            '&:active': {
                backgroundColor: 'white'
            },
            '&:hover': {
                backgroundColor: '#F3F4F6'
            }
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'black',
        }),
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'white',
            borderColor: '#D1D5DB',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#D1D5DB'
            },
            outline: 'none',
            border: '1px solid #D1D5DB',
            '&:focus': {
                outline: 'none',
                border: '1px solid #D1D5DB',
                boxShadow: 'none'
            }
        }),
        input: (provided) => ({
            ...provided,
            color: 'black',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'white',
            border: '1px solid #D1D5DB',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }),
        container: (provided) => ({
            ...provided,
            '&:focus': {
                outline: 'none'
            },
            '&:focus-within': {
                outline: 'none'
            }
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            '& > div': {
                padding: '4px'
            }
        })
    };

    return (
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-6">
            <div>
                <InputLabel htmlFor="task_image_path" value="Task Image" />
                <TextInput
                    id="task_image_path"
                    type="file"
                    name="image"
                    className="mt-1 block w-full"
                    onChange={(e) => setData("image", e.target.files[0])}
                />
                <InputError message={errors.image} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="task_name" value="Task Name" />
                <TextInput
                    id="task_name"
                    type="text"
                    name="name"
                    value={data.name}
                    className="mt-1 block w-full"
                    isFocused={true}
                    onChange={(e) => setData("name", e.target.value)}
                />
                <InputError message={errors.name} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="task_category" value="Category" />
                <Select
                    id="task_category"
                    options={categoryOptions}
                    value={categoryOptions.find(option => option.value === data.category_id) || null}
                    onChange={(option) => setData("category_id", option ? option.value : "")}
                    className="mt-1"
                    classNamePrefix="select"
                    styles={customStyles}
                />
                <InputError message={errors.category_id} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="task_due_date" value="Due Date" />
                <TextInput
                    id="task_due_date"
                    type="date"
                    name="due_date"
                    value={data.due_date}
                    className="mt-1 block w-full"
                    onChange={(e) => setData("due_date", e.target.value)}
                />
                <InputError message={errors.due_date} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="task_assigned_user" value="Assigned User" />
                <Select
                    id="task_assigned_user"
                    options={userOptions}
                    value={userOptions.find(option => option.value === data.assigned_user_id) || null}
                    onChange={(option) => setData("assigned_user_id", option ? option.value : "")}
                    className="mt-1"
                    classNamePrefix="select"
                    styles={customStyles}
                />
                <InputError message={errors.assigned_user_id} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="task_status" value="Status" />
                <Select
                    id="task_status"
                    options={statusOptions}
                    value={statusOptions.find(option => option.value === data.status) || null}
                    onChange={(option) => setData("status", option ? option.value : "")}
                    className="mt-1"
                    classNamePrefix="select"
                    styles={customStyles}
                />
                <InputError message={errors.status} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="task_priority" value="Priority" />
                <Select
                    id="task_priority"
                    options={priorityOptions}
                    value={priorityOptions.find(option => option.value === data.priority) || null}
                    onChange={(option) => setData("priority", option ? option.value : "")}
                    className="mt-1"
                    classNamePrefix="select"
                    styles={customStyles}
                />
                <InputError message={errors.priority} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="task_factory_id" value="Factory ID" />
                <TextInput
                    id="task_factory_id"
                    type="text"
                    name="factory_id"
                    value={data.factory_id}
                    className="mt-1 block w-full"
                    onChange={(e) => setData("factory_id", e.target.value)}
                />
                <InputError message={errors.factory_id} className="mt-2" />
            </div>

            <div className="col-span-2">
                <InputLabel htmlFor="task_description" value="Task Description" />
                <div className="mt-1">
                    <CKEditor
                        editor={ClassicEditor}
                        data={data.description}
                        config={{
                            toolbar: {
                                items: [
                                    'heading',
                                    '|',
                                    'bold',
                                    'italic',
                                    'link',
                                    'bulletedList',
                                    'numberedList',
                                    '|',
                                    'outdent',
                                    'indent',
                                    '|',
                                    'blockQuote',
                                    'insertTable',
                                    'undo',
                                    'redo'
                                ]
                            },
                            table: {
                                contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
                            }
                        }}
                        onReady={editor => {
                            editor.editing.view.change(writer => {
                                writer.setStyle(
                                    'min-height',
                                    '300px',
                                    editor.editing.view.document.getRoot()
                                );
                                writer.setStyle(
                                    'color',
                                    'black',
                                    editor.editing.view.document.getRoot()
                                );
                            });
                        }}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            setData('description', data);
                        }}
                    />
                </div>
                <InputError message={errors.description} className="mt-2" />
            </div>

            <div className="flex items-center justify-end mt-4 col-span-2">
                <Link
                    href={route("tasks.index")}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 mr-2"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    Create Task
                </button>
            </div>
        </form>
    );
}
