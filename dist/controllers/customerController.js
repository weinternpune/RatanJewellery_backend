"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.getCustomerById = exports.getCustomers = void 0;
const Customer_1 = require("../models/Customer");
const getCustomers = async (req, res, next) => {
    try {
        const customers = await Customer_1.Customer.find()
            .populate("userId", "name email phone createdAt")
            .sort({ createdAt: -1 });
        const formatted = customers.map((c) => ({
            id: c._id,
            name: c.userId?.name || "",
            email: c.userId?.email || "",
            phone: c.userId?.phone || "",
            totalSpend: c.totalPurchases || 0,
            loyaltyPoints: c.loyaltyPoints || 0,
            segment: c.segment,
            birthday: c.dateOfBirth,
            notes: c.notes,
            createdAt: c.createdAt,
        }));
        res.json({
            success: true,
            data: formatted,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomers = getCustomers;
const getCustomerById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const customer = await Customer_1.Customer.findById(id).populate("userId", "name email phone createdAt");
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }
        res.json({
            success: true,
            data: {
                id: customer._id,
                name: customer.userId?.name || "",
                email: customer.userId?.email || "",
                phone: customer.userId?.phone || "",
                totalSpend: customer.totalPurchases || 0,
                loyaltyPoints: customer.loyaltyPoints || 0,
                segment: customer.segment,
                birthday: customer.dateOfBirth,
                notes: customer.notes,
                createdAt: customer.createdAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerById = getCustomerById;
const updateCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const customer = await Customer_1.Customer.findById(id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }
        customer.notes = req.body.notes ?? customer.notes;
        customer.totalPurchases = req.body.totalSpend ?? customer.totalPurchases;
        customer.segment = req.body.segment ?? customer.segment;
        if (req.body.birthday) {
            customer.dateOfBirth = new Date(req.body.birthday);
        }
        await customer.save();
        res.json({
            success: true,
            message: "Customer updated",
            data: customer,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const customer = await Customer_1.Customer.findByIdAndDelete(id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }
        res.json({
            success: true,
            message: "Customer deleted",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCustomer = deleteCustomer;
//# sourceMappingURL=customerController.js.map