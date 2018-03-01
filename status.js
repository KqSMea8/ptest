let jd = {
    已完成: 'Successful',
    出票成功: 'Successful',
    等待收货: 'Successful',
    充值成功: 'Successful',
    '已完成</br>(充值成功)': 'Successful',
    正在出库: 'Successful',
    商品出库: 'Successful',
    等待处理: 'Successful',
    等待厂商处理: 'Successful',
    正在处理: 'Successful',
    缴费成功: 'Successful',
    请上门自提: 'Successful',
    等待付款: 'Successful',
    '部分充值成功 退款成功': 'Successful',
    卡密提取成功: 'Successful',
    等待审核: 'Successful',
    抢票中: 'Successful',
    已取消: 'Cancelled',
    订单取消: 'Cancelled',
    抢票已取消: 'Cancelled',
    出票失败: 'Failed',
    未抢中: 'Failed',
    已关闭: 'Failed',
    '充值失败，退款成功': 'Refunded',
    商品退库: 'Refunded',
    退款完成: 'Refunded',
    配送退货: 'Refunded',
    失败退款: 'Refunded',
}

let tm = {

    交易成功: 'Successful',
    出票成功: 'Successful',
    物流派件中: 'Successful',
    物流运输中: 'Successful',
    快件已签收: 'Successful',
    买家已付款: 'Successful',
    订票成功: 'Successful',
    卖家已发货: 'Successful',
    预定成功: 'Successful',
    已发奖: 'Successful',
    快件已揽收: 'Successful',
    已入住: 'Successful',
    提交需求成功: 'Successful',
    审核通过: 'Successful',
    商家已确认: 'Successful',
    部分发货: 'Successful',
    线下支付: 'Successful',
    卖家已确认: 'Successful',
    拼团成功: 'Successful',
    充值成功: 'Successful',
    等待买家付款: 'Successful',
    待付款: 'Successful',
    已提交: 'Successful',
    已取消: 'Cancelled',
    交易关闭: 'Failed',
    订票失败: 'Failed',
    失效: 'Failed',
    投保失败: 'Failed',
    '超时未付款，订单已关闭': 'Failed',
    申请已关闭: 'Failed',
    未中奖: 'Failed',
    审核未通过: 'Failed',
    未付款: 'Failed',
    已退款: 'Refunded',
    '影院出票失败，已退款': 'Refunded'
}

let set = { 0: jd, 1: tm };

function getStatus(pfIdx, originStatus) {
    return set[pfIdx][originStatus];
}

exports.getStatus = getStatus;