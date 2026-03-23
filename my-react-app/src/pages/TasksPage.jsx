import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import TaskCard from "../components/TaskCard";
import { API_URL } from "../../proxy";

export default function TasksPage() {
    const location = useLocation();

    const [tasks, setTasks] = useState([]);
    const [data, setData] = useState([]);
    const [columnsDef, setColumnsDef] = useState([]);

    // ✅ Get project name from URL
    const params = new URLSearchParams(location.search);
    const projectName = params.get("project");

    // ✅ Fetch all rows
    const getAllRows = async () => {
        const res = await fetch(`${API_URL}/api/development`);
        const result = await res.json();
        setData(result);
        console.log("getAllRows", result);
    };

    // ✅ Fetch columns
    const getColumns = async () => {
        const res = await fetch(`${API_URL}/api/columns`);
        const result = await res.json();
        setColumnsDef(result);
    };

    // ✅ Fetch project tasks
    const getMainprojects = async (projectName) => {
        const res = await fetch(`${API_URL}/api/mainProject`);
        const mainProjects = await res.json();

        const selectedProject = mainProjects.find(
            (p) => p.mainProjectName === projectName
        );
        setTasks(selectedProject?.tasks || []);
    };

    useEffect(() => {
        getAllRows();
        getColumns();
    }, []);

    useEffect(() => {
        if (projectName) {
            getMainprojects(projectName);
        }
    }, [projectName]);

    // ✅ FAST lookup using Map
    const dataMap = useMemo(() => {
        const map = new Map();
        data.forEach((row) => map.set(String(row._id), row));
        return map;
    }, [data]);

    // ✅ Get only required rows
    const filteredRows = useMemo(() => {
        return tasks
            .map((t) => dataMap.get(String(t.rowId)))
            .filter(Boolean);
    }, [tasks, dataMap]);

    const groupedData = useMemo(() => {
        return filteredRows.reduce((acc, row) => {
            if (!acc[row]) acc[row] = [];
            acc[row].push(row);

            return acc;
        }, {});
    }, [filteredRows]);

    return (
        <div className="flex gap-6 overflow-x-auto p-4 bg-[#0f172a] min-h-screen">

            {Object.entries(groupedData).map(([status, rows]) => (
                <div
                    className="min-w-[300px] rounded-2xl p-4"
                >
                    <h2 className="font-semibold mb-3">Total Tasks ({rows.length})
                    </h2>

                    <div className="flex flex-col gap-3 max-h-[75vh] overflow-y-auto">
                        {rows.map((row) => (
                            <TaskCard
                                key={row._id}
                                row={row}
                                columnsDef={columnsDef}
                            />
                        ))}
                    </div>
                </div>
            ))}

        </div>
    );
}