// src/services/apiservice.ts
import http from "./http"; // <-- your custom axios instance with interceptors

class ApiService {
  // POST
  postMethod(url: string, data?: any, config?: any) {
    return http.post(url, data, config);
  }

  // GET
  getMethod(url: string, config?: any) {
    return http.get(url, config);
  }

  // PUT
  putMethod(url: string, data?: any, config?: any) {
    return http.put(url, data, config);
  }

  // DELETE
  deleteMethod(url: string, config?: any) {
    return http.delete(url, config);
  }

  // PATCH (optional)
  patchMethod(url: string, data?: any, config?: any) {
    return http.patch(url, data, config);
  }
}

export default new ApiService();
