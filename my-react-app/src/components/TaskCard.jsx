
import { AiTwotoneMail } from "react-icons/ai";

function TaskCard({ row, columnsDef = [] }) {

    const columnMap = {};
    columnsDef.forEach((col) => {
        columnMap[col.name] = col.column_heading;
    })
    console.log("columnsDef",)
    const statusField = columnsDef.find((c) => c.type === "status")?.name;
    const projectField = columnsDef.find((c) => c.type === "project")?.name;

    console.log(projectField);
    const status = row[statusField];

    const statusColors = {
        "Not started": "bg-gray-500",
        "In progress": "bg-blue-500",
        "OFF TRACK": "bg-red-500",
        "COMPLETED": "bg-green-500",
    };
    console.log("row", row);

    return (
        <div className="bg-[#334155] p-4 rounded-xl shadow-md hover:shadow-xl transition">
            {/* <div class="card">
                <h5 class="card-header">{row.project1768984734240 || "Untitled"}</h5>
                <div class="card-body">
                    <h5 class="card-title">{row.category1768984938173}</h5>
                    <div className="d-flex">
                        <a href={`mailto:${row.client_email1771568580679}`}><AiTwotoneMail /></a>
                        <a href={row.client_website1771568591613}></a>
                    </div>
                    <p class="card-text">With supporting text below as a natural lead-in to additional content.</p>
                    <a href="#" class="btn btn-primary">Go somewhere</a>
                </div>
            </div> */}

            {/* Dynamic fields */}
            <div className="text-xs text-gray-300 space-y-1">
                {Object.entries(row).map(([key, value]) => {

                    if (
                        !value ||
                        ["_id", "__v", "createdAt", "updatedAt", "lastChangedByUserName", "lastChangedAt", "showstatus", "createdByUserId", "createdByUserName"].includes(key) ||
                        key === projectField ||
                        key === statusField
                    ) return null;

                    return (
                        <div key={key}>
                            <span className="text-gray-400">
                                {columnMap[key] || key}:
                            </span>{" "}
                            {value}
                        </div>
                    );
                })}
            </div>

        </div >
    );
}

export default TaskCard;