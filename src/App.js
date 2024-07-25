import { useState } from "react";
import "./App.css";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
const tempListsData = [
  {
    id: crypto.randomUUID(),
    name: "Games Tier List",
    image: "image1.jpeg",
    rows: [
      {
        id: crypto.randomUUID(),
        title: "S",
        content: ["gow.jpeg", "sekiro.jpg", "inscryption.jpeg"],
      },
      {
        id: crypto.randomUUID(),
        title: "A",
        content: ["medium.jpeg", "tunic.jpeg"],
      },
      { id: crypto.randomUUID(), title: "B", content: ["cod.jpeg"] },
      { id: crypto.randomUUID(), title: "C", content: ["outerwilds.jpeg"] },
    ],
  },
  {
    id: crypto.randomUUID(),
    name: "Anime Tier List",
    image: "image2.jpg",
    rows: [],
  },
  { id: crypto.randomUUID(), name: "Movies Tier List", rows: [] },
];

function App() {
  const [listData, setListData] = useState(tempListsData);
  const [activeId, setActiveId] = useState("");
  const [listFormIsActive, setListFormIsActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  async function handleDragEnd(event) {
    if (event.over) {
      const sourceId = event.active.id;
      const destinationId = event.over.id;

      console.log(sourceId);
      console.log(uploadedImages.includes(sourceId));

      if (uploadedImages.includes(sourceId)) {
        setUploadedImages((prevItems) =>
          prevItems.filter((item) => item !== sourceId)
        );
      }

      if (destinationId === "content-area") {
        setUploadedImages((prevItems) => [...prevItems, sourceId]);
      }

      await setListData((prevData) =>
        prevData.map((list) =>
          list.id !== activeId
            ? list
            : {
                ...list,
                rows: list.rows.map((row) =>
                  !row.content.includes(sourceId)
                    ? row
                    : {
                        ...row,
                        content: row.content.filter(
                          (item) => item !== sourceId
                        ),
                      }
                ),
              }
        )
      );
      setListData((prevData) =>
        prevData.map((list) =>
          list.id !== activeId
            ? list
            : {
                ...list,
                rows: list.rows.map((row) =>
                  row.id !== destinationId
                    ? row
                    : { ...row, content: [...row.content, sourceId] }
                ),
              }
        )
      );
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Header />
      <Main>
        {!activeId ? (
          listFormIsActive ? (
            <ListForm
              setListData={setListData}
              setListFormIsActive={setListFormIsActive}
            />
          ) : (
            <TierLists
              listData={listData}
              setActiveId={setActiveId}
              setListFormIsActive={setListFormIsActive}
            />
          )
        ) : (
          <>
            <TierList
              key={activeId}
              activeId={activeId}
              listData={listData}
              setActiveId={setActiveId}
              setListData={setListData}
              setUploadedImages={setUploadedImages}
            />
            <ContentArea
              uploadedImages={uploadedImages}
              setUploadedImages={setUploadedImages}
              key={activeId}
            />
          </>
        )}
      </Main>
    </DndContext>
  );
}

function Header() {
  return (
    <header>
      <h1>Tierify</h1>
    </header>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function ListForm({ setListData, setListFormIsActive }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    setImage(fileUrl);
    setError(null);
  };

  function handleCreateList(e) {
    e.preventDefault();
    let id = crypto.randomUUID();
    const newList = { id, image, name, rows: [] };
    setListData((prevData) => [...prevData, newList]);
    setListFormIsActive(false);
  }

  return (
    <>
      <button
        onClick={() => setListFormIsActive(false)}
        className="close-list-button"
      >
        &#x2190;
      </button>
      <form>
        <h2>Create a New List</h2>
        <div className="form-div">
          <label>Add a cover photo </label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="form-div">
          <label>Enter the name of the List</label>
          <input
            value={name}
            type="text"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button onClick={(e) => handleCreateList(e)} className="form-button">
          Create List
        </button>
      </form>
    </>
  );
}

function TierLists({ listData, setActiveId, setListFormIsActive }) {
  return (
    <>
      {listData.map((list) => (
        <TierListCard list={list} key={list.id} setActiveId={setActiveId} />
      ))}
      <button
        onClick={() => setListFormIsActive(true)}
        className="add-list-button"
      >
        +
      </button>
    </>
  );
}

function TierListCard({ list, setActiveId }) {
  return (
    <div className="card">
      <img
        className="card-image"
        src={list?.image || "placeholder.png"}
        alt={list.name}
      />
      <h2 className="card-name">{list.name}</h2>
      <button
        onClick={() => setActiveId((id) => list.id)}
        className="card-button"
      >
        Open List
      </button>
    </div>
  );
}

function TierList({
  activeId,
  listData,
  setActiveId,
  setListData,
  setUploadedImages,
}) {
  const list = listData.find((list) => list.id === activeId);
  function handleAddNewRow() {
    const id = crypto.randomUUID();
    const newRow = { id, title: "Enter Title", content: [] };
    setListData((prevData) => {
      return prevData.map((list) =>
        list.id !== activeId ? list : { ...list, rows: [...list.rows, newRow] }
      );
    });
  }

  return (
    <>
      <button
        onClick={() => {
          setUploadedImages([]);
          setActiveId("");
        }}
        className="close-list-button"
      >
        &#x2190;
      </button>
      <h2 className="list-name">{list.name}</h2>
      <div className="tier-list-div">
        {list?.rows.map((row) => (
          <div className="tier-row">
            <textarea
              className="row-title"
              value={row?.title}
              onChange={(e) => {
                console.log(e.target.value);
                setListData((prevData) =>
                  prevData.map((list) =>
                    list.id !== activeId
                      ? list
                      : {
                          ...list,
                          rows: list.rows.map((prevRow) =>
                            prevRow.id === row.id
                              ? { ...prevRow, title: e.target.value }
                              : prevRow
                          ),
                        }
                  )
                );
              }}
            />
            <RowContent key={row.id} row={row} />
          </div>
        ))}
        <div onClick={handleAddNewRow} className="tier-row">
          Add another row
        </div>
      </div>
    </>
  );
}

function RowContent({ row }) {
  const { setNodeRef } = useDroppable({
    id: row.id,
  });
  return (
    <div className="row-content" ref={setNodeRef}>
      {row?.content.map((img) => (
        <RowContentImage img={img} />
      ))}
    </div>
  );
}

function RowContentImage({ img }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: img,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <img
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="row-image"
      src={img}
      alt={img}
    />
  );
}

function ContentArea({ setUploadedImages, uploadedImages }) {
  const { setNodeRef } = useDroppable({
    id: "content-area",
  });

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const fileUrls = files.map((file) => URL.createObjectURL(file));
    setUploadedImages((prevImages) => [...prevImages, ...fileUrls]);
  };

  return (
    <div className="content-area" ref={setNodeRef}>
      {uploadedImages.map((src, index) => (
        <RowContentImage img={src} />
      ))}

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}

function Footer() {
  return <footer></footer>;
}

export default App;
