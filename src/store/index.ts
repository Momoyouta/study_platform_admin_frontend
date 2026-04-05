import { createContext, useContext } from "react";
import { User } from "./user";
import { Course } from "./course";

const Store = {
    UserStore: new User(),
    CourseStore: new Course(),
}

const StoreContext = createContext(Store);

export const useStore = () => useContext(StoreContext);
export const StoreProvider = StoreContext.Provider;

export default Store;