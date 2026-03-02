export default function UploadProof() {
  const [file, setFile] = useState(null);

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
