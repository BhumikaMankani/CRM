import { useEffect, useState } from "react";
import { API_URL } from "../../proxy";

const Updator = () => {
    const [loading, setLoading] = useState(false);

    // const updateColumnDefaultValue = async () => {
    //     try {
    //         setLoading(true);

    //         const response = await fetch(
    //             `${API_URL}/api/updateDefaultValues`,
    //             {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //             }
    //         );

    //         const data = await response.json();

    //         if (data.success) {
    //             alert("✅ Default values updated successfully");
    //         } else {
    //             alert("❌ Update failed");
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         alert("❌ Server error");
    //     } finally {
    //         setLoading(false);
    //     }
    // };


    return (
        <div>
            {/* <button
                type="button"
                onClick={updateColumnDefaultValue}
                disabled={loading}
            >
                {loading ? "Updating..." : "Default Value Update"}
            </button> */}
        </div>
    );
};

export default Updator;
