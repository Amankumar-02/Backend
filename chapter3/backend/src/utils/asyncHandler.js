// Here we create a custom/ wrapper function

// 1. By try and catch
const asyncHandler = (requestHandler)=>{
    (req, res, next)=>{
        Promise.resolve(requestHandler(req, res, next))
        .catch(err=>next(err));
    }
};



/* // 2. By Promises High Order Function ==> take a function and return a function
const func2 = (func)=>{return ()=>{}};
//Short 
const asyncHandler = (fn)=> async(req, res, next)=>{
    try {
        await fn(req, res, next)
    } catch (error) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message,
        })
    }
} */

export {asyncHandler};