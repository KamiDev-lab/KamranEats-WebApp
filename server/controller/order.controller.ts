import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant.model";
import { Order } from "../models/order.model";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type CheckoutSessionRequest = {
    cartItems: {
        menuId: string;
        name: string;
        image: string;
        price: number;
        quantity: number
    }[],
    deliveryDetails: {
        name: string;
        email: string;
        address: string;
        city: string
    },
    restaurantId: string
}

export const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({ user: req.id }).populate('user').populate('restaurant');
        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const createCheckoutSession = async (req: Request, res: Response) => {
    try {
        const checkoutSessionRequest: CheckoutSessionRequest = req.body;
        console.log(checkoutSessionRequest)
        const restaurant = await Restaurant.findById(checkoutSessionRequest.restaurantId).populate('menus');
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found."
            })
        };
        const order: any = new Order({
            restaurant: restaurant._id,
            user: req.id,
            deliveryDetails: checkoutSessionRequest.deliveryDetails,
            cartItems: checkoutSessionRequest.cartItems,
            status: "pending"
        });

        // line items
        const menuItems = restaurant.menus;
        const lineItems = createLineItems(checkoutSessionRequest, menuItems);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            shipping_address_collection: {
                allowed_countries: ['GB', 'US', 'CA']
            },
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.LOCAL_FRONTEND_URL}/order/status`,
            cancel_url: `${process.env.LOCAL_FRONTEND_URL}/cart`,
            metadata: {
                orderId: order._id.toString(),
                images: JSON.stringify(menuItems.map((item: any) => item.image))
            }
        });
        if (!session.url) {
            return res.status(400).json({ success: false, message: "Error while creating session" });
        }
        await order.save();
        return res.status(200).json({
            session
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })

    }
}

export const stripeWebhook = async (req: Request, res: Response) => {
    let event;

    try {
        const signature = req.headers["stripe-signature"];
        const payloadString = JSON.stringify(req.body, null, 2);
        const secret = process.env.WEBHOOK_ENDPOINT_SECRET!;

        event = stripe.webhooks.constructEvent(payloadString, signature as string, secret);

    } catch (error: any) {
        console.error('Webhook error:', error.message);
        return res.status(400).send(`Webhook error: ${error.message}`);
    }

    if (event.type === "checkout.session.completed") {
        try {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata?.orderId;
            const totalAmount = session.amount_total;

            const updatedOrder = await Order.findByIdAndUpdate(
                orderId,
                {
                    status: "confirmed",
                    totalAmount: totalAmount,
                },
                { new: true }
            );

            if (!updatedOrder) {
                console.log(`Order with id ${orderId} not found`);
                return res.status(404).json({ message: "Order not found" });
            }
            
            console.log("Order updated successfully:", updatedOrder);

        } catch (error) {
            console.error('Error handling event:', error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    res.status(200).send();
};

export const createLineItems = (checkoutSessionRequest: CheckoutSessionRequest, menuItems: any) => {
    // 1. create line items
    const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
        const menuItem = menuItems.find((item: any) => item._id.toString() === cartItem.menuId);
        if (!menuItem) throw new Error(`Menu item id not found`);

        return {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: menuItem.name,
                    images: [menuItem.image],
                },
                unit_amount: menuItem.price * 100
            },
            quantity: cartItem.quantity,
        }
    })
    // 2. return lineItems
    return lineItems;
}