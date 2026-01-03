import { Link, useNavigate, useParams } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { queryClient, fetchEvent, updateEvent } from "../../util/http.js";
import { useQuery, useMutation } from "@tanstack/react-query";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
    enabled: id !== undefined,
  });
  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const newEvent = data.event;
      await queryClient.cancelQueries({ queryKey: ["events", id] });
      const previousEvent = queryClient.getQueriesData(["events", id]); //hold previous data
      queryClient.setQueriesData(["events", id], newEvent); //set new data to cache
      return { previousEvent };
    },
    onError: (error, data, context) => {
      queryClient.setQueriesData(["events", id], context.previousEvent); //context hold the previous data
    },
    onSettled: () => {
      queryClient.invalidateQueries(["events", id]); // re-fetch all the data
    },
  });

  function handleSubmit(formData) {
    mutate({ id: id, event: formData });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }
  if (isPending) {
    return <LoadingIndicator />;
  }
  if (isError) {
    return (
      <ErrorBlock
        title="An error occurred"
        message={error.info?.message || "failed to fetch request"}
      />
    );
  }

  return (
    <Modal onClose={handleClose}>
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    </Modal>
  );
}
