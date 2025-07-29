import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar.jsx";
import NoteCard from "../../components/Cards/NoteCard.jsx";
import { MdAdd } from "react-icons/md";
import AddEditNotes from "./AddEditNotes.jsx";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isOpen: false,
    type: "add",
    data: null,
  });

  const [allNotes, setAllNotes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSearch, setIsSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [notesPerPage] = useState(9);
  const [totalNotes, setTotalNotes] = useState(0);

  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isOpen: true, type: "edit", data: noteDetails });
  };

  //Fetch user info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data?.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  //Fetch all notes
  const getAllNotes = async (page = 1) => {
    try {
      const response = await axiosInstance.get(
        `/get-all-notes?page=${page}&limit=${notesPerPage}`
      );
      if (response.data?.notes) {
        setAllNotes(response.data.notes);
        setTotalNotes(response.data.totalCount);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  // Delete note
  const deleteNote = async (data) => {
    try {
      const response = await axiosInstance.delete(`/delete-note/${data._id}`);

      if (response.data && response.data.error === false) {
        // Remove note from UI immediately
        setAllNotes((prevNotes) =>
          prevNotes.filter((note) => note._id !== data._id)
        );
        toast.success(response.data.message || "Note deleted successfully!");
      } else {
        toast.error("Something went wrong.");
      }
    } catch (error) {
      toast.error("Failed to delete note.");
      console.error("Delete error:", error);
    }
  };

  // Search notes
  const onSearchNotes = async (query) => {
    if (!query.trim()) {
      // if empty search, reset to all notes
      getAllNotes();
      setIsSearch(false);
      return;
    }

    try {
      const response = await axiosInstance.get(`/search-notes/?query=${query}`);
      if (response.data?.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.error("Error searching notes:", error);
    }
  };

  // Pin note
  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;
    const newPinnedStatus = !noteData.isPinned;

    try {
      const response = await axiosInstance.put(`/update-pin-status/${noteId}`, {
        isPinned: newPinnedStatus,
      });

      if (response.data?.note) {
        if (newPinnedStatus) {
          toast.success("Note pinned successfully");
        } else {
          toast.success("Note unpinned successfully");
        }
        getAllNotes();
      }
    } catch (error) {
      toast.error("Failed to update note.");
    }
  };

  useEffect(() => {
    getUserInfo();
    getAllNotes();
  }, []);

  const handleNoteAdded = (message = "Note added successfully") => {
    getAllNotes();
    setSuccessMessage(message);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  return (
    <>
      <Navbar
        userInfo={userInfo}
        setUserInfo={setUserInfo}
        onSearchNotes={onSearchNotes}
      />

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="container mx-auto px-14 mt-4">
        {successMessage && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded shadow mb-4">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mt-4">
          {allNotes.length === 0 ? (
            <p className="text-gray-500 col-span-3">No notes found</p>
          ) : (
            allNotes.map((item) => (
              <NoteCard
                key={item._id}
                title={item.title}
                date={item.createdOn}
                content={item.content}
                tags={item.tags}
                isPinned={item.isPinned}
                onEdit={() => handleEdit(item)}
                onDelete={() => {
                  deleteNote(item);
                }}
                onPinNote={() => {
                  updateIsPinned(item);
                }}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex justify-center mt-6 space-x-2">
        {Array.from(
          { length: Math.ceil(totalNotes / notesPerPage) },
          (_, index) => (
            <button
              key={index + 1}
              onClick={() => getAllNotes(index + 1)}
              className={`px-4 py-2 rounded ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {index + 1}
            </button>
          )
        )}
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-500 hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() =>
          setOpenAddEditModal({
            isOpen: true,
            type: "add",
            data: null,
          })
        }
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isOpen}
        onRequestClose={() =>
          setOpenAddEditModal((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
          },
        }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() =>
            setOpenAddEditModal((prev) => ({
              ...prev,
              isOpen: false,
            }))
          }
          getAllNotes={getAllNotes}
          onNoteAdded={handleNoteAdded}
        />
      </Modal>
    </>
  );
};

export default Home;
