import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { adminRequestService } from "../services/adminRequestService";
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminApproval() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("");

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const action = searchParams.get("action");

  useEffect(() => {
    const processApproval = async () => {
      if (!uid || !token || !action) {
        setStatus("error");
        setMessage("Invalid approval link. Missing parameters.");
        return;
      }

      if (action !== "accept" && action !== "reject") {
        setStatus("error");
        setMessage("Invalid action. Use 'accept' or 'reject'.");
        return;
      }

      try {
        const result = await adminRequestService.processAction(uid, token, action);
        setStatus("success");
        setMessage(result.message);
        toast.success(result.message);
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "Failed to process request.");
        toast.error(err.message || "Failed to process request.");
      }
    };

    processApproval();
  }, [uid, token, action]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === "processing" && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
              <Loader2 size={32} className="text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h1>
            <p className="text-gray-500">Please wait while we process the admin request.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Action Completed</h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Go to Home
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something Went Wrong</h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Go to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}

