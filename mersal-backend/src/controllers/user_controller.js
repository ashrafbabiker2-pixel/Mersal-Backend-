const bcrypt = require('bcryptjs');

const User = require('../models/user_model');

/*
|--------------------------------------------------------------------------
| Get Current User Profile
|--------------------------------------------------------------------------
*/

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Update Current User Profile
|--------------------------------------------------------------------------
*/

const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      profileImage
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    if (name !== undefined) {
      if (name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'الاسم غير صالح'
        });
      }

      user.name = name.trim();
    }

    if (phone !== undefined) {
      const normalizedPhone = phone.trim();

      const existingPhone = await User.findOne({
        phone: normalizedPhone,
        _id: {
          $ne: user._id
        }
      });

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: 'رقم الهاتف مستخدم بالفعل'
        });
      }

      user.phone = normalizedPhone;
    }

    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث البيانات بنجاح',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Change Password
|--------------------------------------------------------------------------
*/

const changePassword = async (req, res, next) => {
  try {
    const {
      currentPassword,
      newPassword
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الحالية والجديدة مطلوبتان'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف'
      });
    }

    const user = await User.findById(
      req.user._id
    ).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'كلمة المرور الحالية غير صحيحة'
      });
    }

    const samePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الجديدة يجب أن تختلف عن الحالية'
      });
    }

    user.password = await bcrypt.hash(
      newPassword,
      12
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Users
|--------------------------------------------------------------------------
|
| الإدارة فقط.
|
*/

const getUsers = async (req, res, next) => {
  try {
    const {
      role,
      isActive
    } = req.query;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({
        createdAt: -1
      });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get User By ID
|--------------------------------------------------------------------------
*/

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(
      req.params.userId
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Create Staff User
|--------------------------------------------------------------------------
|
| يتم إنشاء الموظفين من الإدارة.
|
*/

const createStaffUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role
    } = req.body;

    const allowedRoles = [
      'employee',
      'supervisor',
      'manager'
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'الدور المطلوب غير مسموح به'
      });
    }

    if (
      !name ||
      !email ||
      !phone ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'جميع بيانات الموظف مطلوبة'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور يجب ألا تقل عن 6 أحرف'
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedPhone =
      phone.trim();

    const existingUser = await User.findOne({
      $or: [
        {
          email: normalizedEmail
        },
        {
          phone: normalizedPhone
        }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل'
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      role,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء حساب الموظف بنجاح',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Update User Role
|--------------------------------------------------------------------------
*/

const updateUserRole = async (req, res, next) => {
  try {
    const {
      role
    } = req.body;

    const allowedRoles = [
      'customer',
      'employee',
      'supervisor',
      'manager'
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'الدور المطلوب غير صالح'
      });
    }

    const user = await User.findById(
      req.params.userId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    /*
    |--------------------------------------------------------------------------
    | حماية حساب Admin
    |--------------------------------------------------------------------------
    */

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'لا يمكن تعديل صلاحيات حساب Admin من هذا المسار'
      });
    }

    user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث صلاحية المستخدم بنجاح',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Activate User
|--------------------------------------------------------------------------
*/

const activateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        isActive: true
      },
      {
        new: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم تفعيل المستخدم بنجاح',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Deactivate User
|--------------------------------------------------------------------------
*/

const deactivateUser = async (req, res, next) => {
  try {
    if (
      req.user._id.toString() ===
      req.params.userId
    ) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك تعطيل حسابك الحالي'
      });
    }

    const user = await User.findById(
      req.params.userId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'لا يمكن تعطيل حساب Admin من هذا المسار'
      });
    }

    user.isActive = false;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'تم تعطيل المستخدم بنجاح',
      data: {
        id: user._id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  getUserById,
  createStaffUser,
  updateUserRole,
  activateUser,
  deactivateUser
};
