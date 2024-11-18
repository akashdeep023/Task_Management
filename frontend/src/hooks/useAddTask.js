import getHeader from "../utils/header";
import { toast } from "react-toastify";
import { setTaskCardM } from "../redux/slices/stateSlice";
const useAddTask = (
	e,
	setLoad,
	title,
	priority,
	checklist,
	dueDate,
	dispatch
) => {
	e.target.disabled = true;
	fetch(`${import.meta.env.VITE_BACKEND_URL}/api/task/add`, {
		method: "POST",
		headers: getHeader(),
		body: JSON.stringify({
			title: title,
			priority: priority,
			checklist: checklist,
			dueDate: dueDate,
		}),
	})
		.then((response) => response.json())
		.then((json) => {
			setLoad("");
			e.target.disabled = false;
			if (json?.message === "success") {
				toast.success("Task Added");
				dispatch(setTaskCardM(false));
			} else {
				toast.error(json?.message);
			}
		})
		.catch((error) => {
			console.error("Error:", error);
			setLoad("");
			toast.error("Something went wrong");
			e.target.disabled = false;
		});
};

export default useAddTask;