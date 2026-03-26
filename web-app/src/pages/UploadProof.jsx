export default function UploadProof() {
  const [file, setFile] = useState(null);

  /** 
   * UploadProof.jsx
   * -----------------------
   * This component renders the upload proof page where users can upload images or PDFs as proof 
   * of their work hours. The component uses React's useState hook to manage the selected file state 
   * and defines a handleUpload function that sends the file to the backend API using a POST request. 
   * The form allows users to select a file and submit it, with feedback provided upon successful upload. 
   * Tailwind CSS is used for styling the page and form elements.
   * 
   */ 
  
  // Handle file upload by sending the selected file to the backend API using a POST request with 
  // multipart/form-data encoding. Provides feedback upon successful upload.
  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("proof", file);

    await api.post("/time-entries/upload-proof", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    alert("Uploaded successfully");
  };

  // Render the upload proof form with a file input and an upload button. The file input accepts 
  // images and PDFs, and the upload button triggers the handleUpload function to send the file to the 
  // backend API.
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Upload Proof</h2>

      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        onClick={handleUpload}
        className="bg-green-600 text-white px-4 py-2 mt-4 rounded"
      >
        Upload
      </button>
    </div>
  );
}
