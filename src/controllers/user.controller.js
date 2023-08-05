const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { userService } = require("../services");
const { response } = require("../app");
const config = require("../config/config");
const { jwtStrategy } = require("../config/passport");
//const { jwt } = require("../config/config");
const jwt = require('jsonwebtoken')

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUser() function


// TODO: CRIO_TASK_MODULE_CART - Update function to process url with query params

/**
 * Get user details
 *  - Use service layer to get User data
 * 
 *  - If query param, "q" equals "address", return only the address field of the user
 *  - Else,
 *  - Return the whole user object fetched from Mongo

 *  - If data exists for the provided "userId", return 200 status code and the object
 *  - If data doesn't exist, throw an error using `ApiError` class
 *    - Status code should be "404 NOT FOUND"
 *    - Error message, "User not found"
 *  - If the user whose token is provided and user whose data to be fetched don't match, throw `ApiError`
 *    - Status code should be "403 FORBIDDEN"
 *    - Error message, "User not found"
 *
 * 
 * Request url - <workspace-ip>:8082/v1/users/6010008e6c3477697e8eaba3
 * Response - 
 * {
 *     "walletMoney": 500,
 *     "address": "ADDRESS_NOT_SET",
 *     "_id": "6010008e6c3477697e8eaba3",
 *     "name": "crio-users",
 *     "email": "crio-user@gmail.com",
 *     "password": "criouser123",
 *     "createdAt": "2021-01-26T11:44:14.544Z",
 *     "updatedAt": "2021-01-26T11:44:14.544Z",
 *     "__v": 0
 * }
 * 
 * Request url - <workspace-ip>:8082/v1/users/6010008e6c3477697e8eaba3?q=address
 * Response - 
 * {
 *   "address": "ADDRESS_NOT_SET"
 * }
 * 
 *
 * Example response status codes:
 * HTTP 200 - If request successfully completes
 * HTTP 403 - If request data doesn't match that of authenticated user
 * HTTP 404 - If user entity not found in DB
 * 
 * @returns {User | {address: String}}
 *
 */
const getUser = catchAsync(async (req, res) => {

  try {
    let data;
    data = await userService.getUserById(req.params.userId);
    if (!data)
      throw new ApiError(httpStatus.NOT_FOUND,"user not found")
    
    const reqToken=req.headers.authorization.split(" ")[1]
    const decode=jwt.verify(reqToken,config.jwt.secret);
    //console.log("decode :::: ",decode.sub !== req.params.userId)
    if(decode.sub !== req.params.userId){
      //console.log("decode i :::: ",decode.sub !== req.params.userId)
      res.status(403).send("no match")
      throw new ApiError(httpStatus.FORBIDDEN,"User does not matches");
    }
    if(req.query.q=="address") {
      addressData = await userService.getUserAddressById(req.params.userId)
      data = {address:addressData.address}
    } 
    console.log("add data : ",data)
    res.status(200).send(data)
  } catch (error) {
    res.status(400).send(error)
  }
});

const setAddress = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.email != req.user.email) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "User not authorized to access this resource"
    );
  }

  const address = await userService.setAddress(user, req.body.address);

  res.send({
    address: address,
  });
});

module.exports = {
  getUser,
  setAddress,
};
