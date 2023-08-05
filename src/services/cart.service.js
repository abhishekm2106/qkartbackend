const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");
const { getProductById } = require("./product.service");
const { BAD_REQUEST } = require("http-status");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods


/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  try {
    const cart = await Cart.findOne({email:user.email}).exec()
    if (cart)
      return cart
    throw new ApiError(404,"User does not have a cart")
  } catch (error) {
    throw new ApiError(404,error.message)
  }
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */

 

const addProductToCart = async (user, productId, quantity) => {
  try {
      let cart = await Cart.findOne({email:user.email}).exec()
      const product = await getProductById(productId)
      if(!product) throw new ApiError(400,"Product doesn't exist in database")
      //console.log("carrrrrrt : : : : :     :",cart)
      if(!cart){
        try {
          cart = await Cart.create({
            email:user.email,
            cartItems:[]
          })

        } catch (error) {
          console.log("error while adding product to cart : ",error)
          throw new ApiError(500,"Internal Server Error")
        }
      }

      const productPresentCart = cart.cartItems.reduce((a,c)=>{
        //console.log("type :    ",productId,typeof productId,c.product._id,typeof c.product._id)
        return a||productId==c.product._id
      },false)
      if(productPresentCart) throw new ApiError(400,"Product already in cart. Use the cart sidebar to update or remove product from cart") 
      cart.cartItems = [...cart.cartItems,{product:product,quantity:quantity}]
      await cart.save()
      return cart
  } catch (error) {
    //console.log("api error",error instanceof ApiError,error.statusCode,error.message)
    if (error instanceof ApiError) throw new ApiError(error.statusCode,error.message)
    else throw new ApiError(500)
  }
    
  
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  let cart = await Cart.findOne({email:user.email}).exec()
  if(!cart) throw new ApiError(400,"User does not have a cart. Use POST to create cart and add a product")
  let product = await getProductById(productId)
  if(!product) throw new ApiError(400,"Product doesn't exist in database")
  const productPresentCart = cart.cartItems.reduce((a,c)=> a||productId==c.product._id,false)
  if(!productPresentCart) throw new ApiError(400, "Product not in cart")
  // const cartItems = cart.cartItems.map(item=>{
  //   if(item.product._id==productId) {
  //     item.quantity = quantity
  //   }
  //   return item
  // })

  if(quantity===0) {
    cart.cartItems = cart.cartItems.filter(item=>item.product._id!=productId)
  }else{
    cart.cartItems.forEach(item => {
      if(item.product._id == productId){
        item.quantity = quantity
      }
    })
  }




  //cart.cartItems = cartItems
  await cart.save()
  return cart
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  let cart = await Cart.findOne({email:user.email}).exec()
  if(!cart) throw new ApiError(400,"User does not have a cart")
  const productPresentCart = cart.cartItems.reduce((a,c)=> a||productId==c.product._id,false)
  if(!productPresentCart) throw new ApiError(400,"Product not in cart")
  cart.cartItems = cart.cartItems.filter(item=>item.product._id!=productId)
  cart.save()
};

// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
const checkout = async (user) => {
  //console.log("user ))) * : ",user)
  let cart = await Cart.findOne({email:user.email}).exec()
  if(!cart) throw new ApiError(httpStatus.NOT_FOUND,"User does not have a cart")
  const productPresentCart = cart.cartItems.length
  if(!productPresentCart) throw new ApiError(BAD_REQUEST,"Product not in cart")
  let isNotDefaultAddress = await user.hasSetNonDefaultAddress()
  console.log("user address : ",isNotDefaultAddress)
  if(!isNotDefaultAddress) throw new ApiError(BAD_REQUEST,"address should be updated") 
  let cartTotal = cart.cartItems.reduce((a,c)=>a+c.quantity*c.product.cost,0)
  if(cartTotal>user.walletMoney) throw new ApiError(BAD_REQUEST,"insufficient wallet balance")
  cart.cartItems = []
  cart.save()
  user.walletMoney = user.walletMoney-cartTotal
  user.save()
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
