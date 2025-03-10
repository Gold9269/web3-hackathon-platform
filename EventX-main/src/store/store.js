import { configureStore} from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import contractReducer from './contractSlice.js'

const store = configureStore({
    reducer: {
        auth : authReducer,
        contract: contractReducer,
    }
});


export default store;