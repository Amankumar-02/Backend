class ApiResponse {
    constructor(
        statusCode, data, message = "Success",
    ){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        // set status code // Read more about status code memo
        this.success = statusCode < 400
    }
}

export {ApiResponse};