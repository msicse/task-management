import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import Alert from "@/Components/Alert";
import { useState, useEffect } from "react";

export default function Create({ auth, success }) {
    const [showSuccess, setShowSuccess] = useState(!!success);
    
    useEffect(() => {
        if (success) {
            setShowSuccess(true);
        }
    }, [success]);

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        short_name: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("departments.store"));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Create Department
                </h2>
            }
        >
            <Head title="Create Department" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {showSuccess && success && (
                        <Alert
                            message={success}
                            type="success"
                            onClose={() => setShowSuccess(false)}
                        />
                    )}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Name" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="short_name"
                                        value="Short Name"
                                    />
                                    <TextInput
                                        id="short_name"
                                        type="text"
                                        name="short_name"
                                        value={data.short_name}
                                        className="mt-1 block w-full"
                                        onChange={(e) =>
                                            setData("short_name", e.target.value)
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.short_name}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <PrimaryButton disabled={processing}>
                                        Create Department
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 