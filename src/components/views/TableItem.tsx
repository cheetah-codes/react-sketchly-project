import { onSnapshot, query, where } from "firebase/firestore";
import { useContext, useEffect } from "react";
import { SearchContext } from "../../contexts/SearchContext";
import { colRef } from "../../utils/firebase.config";

type TableItemProps = {
  [key: string]: any;
};

const TableItem = ({
  organization,
  username,
  email,
  phoneNumber,
  DateJoined,
  Status,
}: TableItemProps) => {
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
      let organizations: Array<TableItemProps | any> = [];
      snap.docs.forEach((doc: any) => {
        organization.push(doc.data());
        console.log("snapshot", organizations);
      });
    });
  }, [organization]);

  return (
    <>
      <tr>
        <td>{organization}</td>
        <td>{username}</td>
        <td>{email}</td>
        <td>{phoneNumber}</td>
        <td>{DateJoined}</td>
        <td>{Status}</td>
      </tr>
    </>
  );
};

export default TableItem;
