import 'bootstrap/dist/js/bootstrap.bundle.min';
import { RiDashboardHorizontalLine } from "react-icons/ri";


const Sidebar = () => {
    return (
        <div className="d-flex flex-column flex-shrink-0 p-3  alert alert-light border" style={{ width: "280px" }} bis_skin_checked="1">
            {/* <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto  text-decoration-none">

                <span className="fs-4">Mandasa</span>
            </a> */}
            <ul className="nav nav-pills flex-column gap-3 mb-auto">
                <li className="nav-item"> <a href="#" className="nav-link active " aria-current="page">
                    {/* <RiDashboardHorizontalLine /> */}
                    Dashboard
                </a>
                </li>

                <li className="nav-item"> <a href="/development" className="nav-link border text-dark " aria-current="page">
                    Development
                </a>
                </li>



                {/* <li>
                    <a href="#" className="nav-link text-white"> <svg className="bi pe-none me-2" width="16" height="16" aria-hidden="true"><use xlinkHref="#speedometer2"></use></svg>
                        Dashboard
                    </a>
                </li>
                <li>
                    <a href="#" className="nav-link text-white"> <svg className="bi pe-none me-2" width="16" height="16" aria-hidden="true"><use xlinkHref="#table"></use></svg>
                        Orders
                    </a>
                </li>
                <li>
                    <a href="#" className="nav-link text-white"> <svg className="bi pe-none me-2" width="16" height="16" aria-hidden="true"><use xlinkHref="#grid"></use></svg>
                        Products
                    </a>
                </li>
                <li>
                    <a href="#" className="nav-link text-white"> <svg className="bi pe-none me-2" width="16" height="16" aria-hidden="true"><use xlinkHref="#people-circle"></use></svg>
                        Customers
                    </a>
                </li> */}
            </ul>


            {/* <hr />
            <div className="dropdown" bis_skin_checked="1"> <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="https://github.com/mdo.png" alt="" width="32" height="32" className="rounded-circle me-2" />
                <strong>mdo</strong> </a>
                <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
                    <li><a className="dropdown-item" href="#">New project...</a></li>
                    <li><a className="dropdown-item" href="#">Settings</a></li>
                    <li><a className="dropdown-item" href="#">Profile</a></li>
                    <li><a className="dropdown-item" href="#">Sign out</a></li>
                </ul>
            </div> */}
        </div>
    )
}

export default Sidebar