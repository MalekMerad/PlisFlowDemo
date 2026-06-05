import { mockApiRequest } from '../../mock/mockApiRouter';

export const uploadDocumentService = async () => {
  return mockApiRequest('http://localhost:5000/api/doc/upload', 'POST');
};

export const getDocumentsBySessionService = async (sessionID) => {
  return mockApiRequest(`http://localhost:5000/api/doc/session/${sessionID}`, 'GET');
};

export const getDocumentsBySessionAndOperationService = async (sessionID, operationID) => {
  return mockApiRequest(
    `http://localhost:5000/api/doc/session/${sessionID}/operation/${operationID}`,
    'GET'
  );
};
