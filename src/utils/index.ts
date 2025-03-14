import usersIcon from "../assets/users-icon.png";
import activeUsers from "../assets/active-users.png";
import loanUsers from "../assets/loan-users.png";
import savingsUsers from "../assets/savings-users.png";

export const customers = [
  "Users",
  "Guarantors",
  "Loans",
  "Decision Models",
  "Savings",
  "Loan Request",
  "Whitelist",
  "Karma",
];

export const businesses = [
  "Organization",
  "Loan Products",
  "Savings Products",
  "Fees and Charges",
  "Transactions",
  "Services",
  "Service Account",
  "Settlements",
  "Reports",
];

export const displayutils = [
  { displayType: "USERS", icon: usersIcon, value: "2543" },
  { displayType: "ACIVE USERS", icon: activeUsers, value: "2543" },
  { displayType: "USERS WITH LOAN", icon: loanUsers, value: "12453" },
  { displayType: "USER WITH SAVINGS", icon: savingsUsers, value: "102453" },
];

// const formater = (digit: number) => {
//   let str:string = `${digit}`

//   // for (let i = 0; i < `${digit}`.length; i++) {
//   //   const element = array[i];
//   // }
//   console.log("this", `${digit}`.length - 1);
// };
// formater(5000000);
