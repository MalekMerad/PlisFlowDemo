import api from "../../utils/api";

const getAllPaymentsApi = () => `http://localhost:5000/api/payment/getAllPayments`;
const updatePaymentApi = (paymentId) => `http://localhost:5000/api/payment/updatePayment/${paymentId}`;

export const getAllPayments = () => {
    return api(getAllPaymentsApi(), "GET", null, null);
};

export const updatePayment = (paymentId, date) => {
    return api(updatePaymentApi(paymentId), "PUT", { date }, null);
};