import { useState } from "react";

export const useForm = initialValues => {
	const [values, setValues] = useState(initialValues);
	const [errors, setErrors] = useState({});

	const handleChange = (name, value) => {
		setValues(prev => ({ ...prev, [name]: value }));
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors(prev => ({ ...prev, [name]: null }));
		}
	};

	const setFieldError = (name, error) => {
		setErrors(prev => ({ ...prev, [name]: error }));
	};

	const clearErrors = () => setErrors({});

	const reset = () => {
		setValues(initialValues);
		setErrors({});
	};

	return {
		values,
		errors,
		handleChange,
		setFieldError,
		clearErrors,
		reset,
	};
};
