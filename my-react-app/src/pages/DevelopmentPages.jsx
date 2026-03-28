import { useParams } from "react-router-dom";
import Development from "../components/Development";

const DepartmentPages = () => {
    const { name } = useParams();
    const collectionName = name.toLowerCase();
    const dataCollection = collectionName + "s";
    const columnCollection = collectionName + "_columns";
    return (
        <div>
            <Development
                departmentKey={name}
                dataCollection={dataCollection}
                columnCollection={columnCollection}
                dataEndpoint={`/api/data?collectionName=${dataCollection}`}
                dataColumns={`/api/columns?collectionName=${columnCollection}`}
            />
        </div>
    );
};

export default DepartmentPages;