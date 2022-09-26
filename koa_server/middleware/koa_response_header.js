//设置响应头的中间件
// ctx指上下文  next指内层中间件执行入口
module.exports = async (ctx, next) => {
    const contentType = 'application/json; charset=UTF-8'
    //ctx.set  设置响应头
    ctx.set('Content-Type',contentType)
    // ctx.response.body = '{"succcess":true}'
    // 设置允许跨域的响应头
    ctx.set('Access-Control-Allow-Origin','*')
    ctx.set('Access-Control-Allow-Methods','OPTIONS,GET,PUT,POST,DELET')
    await next()
}