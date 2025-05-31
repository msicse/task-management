import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import TaskFileUpload from '@/Components/TaskFileUpload';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ auth, users, projects, departments, categories }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        deadline: '',
        priority: '',
        status: 'new',
        assigned_to: '',
        project_id: '',
        department_id: '',
        category_id: '',
        files: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();

        Object.keys(data).forEach(key => {
            if (key !== 'files') {
                formData.append(key, data[key]);
            }
        });

        if (data.files && data.files.length) {
            data.files.forEach(file => {
                formData.append('files[]', file);
            });
        }

        post(route('tasks.store'), {
            data: formData,
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Create Task" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h1 className="text-2xl font-semibold text-gray-900">Create New Task</h1>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                                <div className="grid grid-cols-6 gap-6">
                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            id="title"
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                                    </div>

                                    <div className="col-span-6">
                                        <label htmlFor="files" className="block text-sm font-medium text-gray-700">
                                            Attachments
                                        </label>
                                        <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                                            <TaskFileUpload
                                                multiple={true}
                                                onChange={(files) => {
                                                    setData('files', files);
                                                }}
                                                error={errors.files}
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Upload any relevant documents or images. Max 10MB per file.
                                        </p>
                                    </div>

                                    <div className="col-span-6">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            {processing ? 'Creating...' : 'Create Task'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
