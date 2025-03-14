import DisplayCard from "../../components/views/DisplayCard";
import { displayutils } from "../../utils";
import "../../styles/pages/dashboard.scss";
import Table from "../../components/views/Table";

const Home = () => {
  return (
    <>
      <section>
        <h1 className="mg-0">Users</h1>
        <div className="display-cards flex">
          {displayutils.map((item, idx) => {
            return (
              <DisplayCard
                key={idx}
                icon={item.icon}
                value={item.value}
                displayType={item.displayType}
              />
            );
          })}
        </div>

        <Table />
      </section>
    </>
  );
};

export default Home;
