import { useContext } from "react";

import {
  BusinessContext,
} from "../context/BusinessContext";

export const useBusiness = () => {
  return useContext(BusinessContext);
};

export default useBusiness;