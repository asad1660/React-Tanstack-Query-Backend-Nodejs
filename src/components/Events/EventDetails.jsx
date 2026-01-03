import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";

import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { queryClient, fetchEvent, deleteEvent } from "../../util/http.js";
export default function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { id: id }],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
    enabled: id !== undefined,
  });
  const { mutate } = useMutation({
    mutationFn: deleteEvent,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none", //this will not re-fetch immediately,on this page it will no fetch
      });
      navigate("/events");
    },
  });
  const formattedDate = new Date(data?.date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  function handleDelete() {
    mutate({ id: id });
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
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        {!isPending && (
          <div id="event-details-content">
            <img src={`http://localhost:3000/${data.image}`} alt="" />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>{formattedDate}</time>
              </div>
              <p id="event-details-description">{data.description}</p>
            </div>
          </div>
        )}
      </article>
    </>
  );
}
