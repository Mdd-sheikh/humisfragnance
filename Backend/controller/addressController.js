import Address from "../models/addressModel.js"
import Users from "../models/User.js"


export const createAddress = async (req, res) => {
    try {
        const user = req.user.id; // from auth middleware
        const {
             fullName, phone, addressLine1,
             city, state, postalCode, country
        } = req.body;

        if (!fullName || !phone || !city || !postalCode) {
            return res.status(400).json({
                message: "please fill all required fields",
                success: false
            });
        }

        const newAddress = await Address.create({
            user: req.user.id, fullName, phone, addressLine1,
            city, state, postalCode, country
        });

        return res.status(201).json({
            message: "Address saved",
            success: true,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "something went wrong",
            success: false
        });
    }
}

export const DeleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const deleted = await Address.findOneAndDelete({ _id: id, user: userId });

        if (!deleted) {
            return res.status(404).json({
                message: "Address not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Address deleted", 
            success: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "something went wrong",
            success: false
        });
    }
}
export const updateAdddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const {
            label, fullName, phone, addressLine1,
            addressLine2, city, state, postalCode, country
        } = req.body;

        const address = await Address.findOne({ _id: id, user: req.user.id });

        if (!address) {
            return res.status(404).json({
                message: "Address not found",
                success: false
            });
        }

        // only update fields that were actually provided
        if (label !== undefined) address.label = label;
        if (fullName !== undefined) address.fullName = fullName;
        if (phone !== undefined) address.phone = phone;
        if (addressLine1 !== undefined) address.addressLine1 = addressLine1;
        if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
        if (city !== undefined) address.city = city;
        if (state !== undefined) address.state = state;
        if (postalCode !== undefined) address.postalCode = postalCode;
        if (country !== undefined) address.country = country;

        await address.save();

        return res.status(200).json({
            message: "Address updated",
            success: true,
            data: address
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "something went wrong",
            success: false
        });
    }
}

export const Getaddress = async (req, res) => {
    try {


        const address = await Address.find({ user: req.user.id }).populate(
            "user",
            "name email"
        );

        if (!address) {
            return res.status(404).json({
                message: "Address not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Address fetched",
            success: true,
            data: address
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "something went wrong",
            success: false
        });
    }
}