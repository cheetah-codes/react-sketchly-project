import { onSnapshot, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../../contexts/SearchContext";
import { colRef } from "../../utils/firebase.config";
import TableItem from "./TableItem";

type TableItemProps = {
  [key: string]: any;
};

interface TableProps<T extends object> {
  userData: T;
}

const Table = <T extends object>({}: TableProps<T[]>) => {
  const [data, setData] = useState<T[]>([]);
  const [organizations, setOrganizations] = useState<TableItemProps | any>([]);
  const headers = [
    "Organization",
    "Username",
    "Email",
    "Phone Number",
    "Date Joined",
    "Status",
  ];

  const { searchval } = useContext(SearchContext);
  useEffect(() => {
    const q = query(
      colRef,
      where("organization", "==", `${searchval}`),
      where("username", "==", `${searchval}`),
      where("email", "==", `${searchval}`),
      where("status", "==", `${searchval}`)
    );

    onSnapshot(q, (snap: any) => {
      snap.docs.forEach((doc: any) => {
        setOrganizations(doc.data());
        console.log("snapshot", doc.data());
        console.log("hey");
      });
    });
  }, []);

  // useEffect(() => {
  //   fetch("http://localhost:8000/organizations")
  //     .then((response) => {
  //       return response.json();
  //     })
  //     .then((data) => {
  //       console.log("data form fetch", data);
  //     });
  // }, []);

  return (
    <div>
      <table>
        <thead>
          {/* <tr>
            {headers.map((headers) => {
              return (
                <th>
                  <p>{headers.toUpperCase()}</p>
                  <TableItem organizations={organizations} />
                </th>
              );
            })}
          </tr> */}
        </thead>
        <tbody></tbody>
      </table>
    </div>
  );
};

export default Table;
