import bcrypt from 'bcryptjs';
import { IUser, IService, IOrder, IApiLog } from '../types.js';

class MersalDatabase {
  public users: Map<string, IUser> = new Map();
  public services: Map<string, IService> = new Map();
  public orders: Map<string, IOrder> = new Map();
  public logs: IApiLog[] = [];
  public isConnected: boolean = true;
  public connectionTime: string = new Date().toISOString();

  constructor() {
    this.seedDatabase();
  }

  public async seedDatabase() {
    this.users.clear();
    this.services.clear();
    this.orders.clear();

    const passwordHash = await bcrypt.hash('Admin123!', 10);
    const customerHash = await bcrypt.hash('Customer123!', 10);
    const driverHash = await bcrypt.hash('Driver123!', 10);

    // 1. Seed Users for all 5 roles
    const initialUsers: IUser[] = [
      {
        _id: 'usr_admin_001',
        name: 'سعود بن محمد (المدير التنفيذي)',
        email: 'admin@mersal.sa',
        phone: '+966500000001',
        password: passwordHash,
        role: 'admin',
        city: 'الرياض',
        address: 'المقر الرئيسي - طريق الملك فهد',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'active',
        permissions: ['all'],
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'usr_mgr_001',
        name: 'م. ناصر القحطاني (مدير العمليات)',
        email: 'manager@mersal.sa',
        phone: '+966500000002',
        password: passwordHash,
        role: 'manager',
        city: 'الرياض',
        address: 'برج الفيصلية',
        status: 'active',
        permissions: ['manage_orders', 'manage_employees', 'view_reports', 'manage_pricing'],
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'usr_sup_001',
        name: 'أحمد الغامدي (مشرف الميدان)',
        email: 'supervisor@mersal.sa',
        phone: '+966500000003',
        password: passwordHash,
        role: 'supervisor',
        city: 'الرياض',
        address: 'فرع الشمال',
        status: 'active',
        permissions: ['assign_tasks', 'approve_expenses', 'inspect_visits'],
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'usr_emp_001',
        name: 'فهد المنصور (فني صيانة ومعاينة)',
        email: 'driver1@mersal.sa',
        phone: '+966551122334',
        password: driverHash,
        role: 'employee',
        city: 'الرياض',
        address: 'حي العقيق',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        status: 'active',
        employeeProfile: {
          employeeCode: 'EMP-7701',
          department: 'maintenance',
          vehicleType: 'van',
          vehiclePlate: 'ب ط ر 4492',
          nationalId: '1098877665',
          rating: 4.9,
          completedOrdersCount: 84,
          isAvailable: true,
          currentLocation: {
            lat: 24.7136,
            lng: 46.6753,
            updatedAt: new Date().toISOString(),
          },
        },
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'usr_emp_002',
        name: 'سالم الدوسري (مندوب شراء ونقل)',
        email: 'driver2@mersal.sa',
        phone: '+966552233445',
        password: driverHash,
        role: 'employee',
        city: 'الرياض',
        address: 'حي السليمانية',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        status: 'active',
        employeeProfile: {
          employeeCode: 'EMP-7702',
          department: 'delivery',
          vehicleType: 'motorcycle',
          vehiclePlate: 'ع ن د 1120',
          nationalId: '1088776655',
          rating: 4.8,
          completedOrdersCount: 142,
          isAvailable: true,
        },
        createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'usr_cust_001',
        name: 'سلطان بن عبدالعزيز',
        email: 'customer1@mersal.sa',
        phone: '+966555123456',
        password: customerHash,
        role: 'customer',
        city: 'الرياض',
        address: 'حي الملقا - شارع أنس بن مالك',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        status: 'active',
        addresses: [
          {
            _id: 'addr_1',
            title: 'فيلا الملقا (المنزل)',
            city: 'الرياض',
            district: 'الملقا',
            street: 'شارع أنس بن مالك',
            buildingNo: '44',
            isDefault: true,
          },
          {
            _id: 'addr_2',
            title: 'مكتب العليا',
            city: 'الرياض',
            district: 'العليا',
            street: 'طريق الملك فهد',
            buildingNo: 'برج الفيصلية 12B',
            isDefault: false,
          },
        ],
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'usr_cust_002',
        name: 'نورة بنت خالد آل سعود',
        email: 'customer2@mersal.sa',
        phone: '+966559876543',
        password: customerHash,
        role: 'customer',
        city: 'الرياض',
        address: 'حي الياسمين',
        status: 'active',
        addresses: [
          {
            _id: 'addr_3',
            title: 'عمارة الياسمين (عقار استثماري)',
            city: 'الرياض',
            district: 'الياسمين',
            street: 'شارع القادسية',
            buildingNo: '18',
            isDefault: true,
          },
        ],
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    initialUsers.forEach((u) => this.users.set(u._id, u));

    // 2. Seed Services
    const initialServices: IService[] = [
      {
        _id: 'srv_property_mgmt',
        code: 'property_management',
        name: 'إدارة الأملاك والعقارات',
        nameEn: 'Property Management',
        category: 'real_estate',
        description: 'معاينة العقار، إدارة عقود الإيجار، تقارير الفحص الدوري بالفيديو والصور، وتحصيل الإيجارات.',
        icon: 'Building2',
        basePrice: 250,
        pricePerKm: 0,
        estimatedDurationHours: 48,
        isActive: true,
        active: true,
        slaHours: 24,
        requiredFields: [
          { key: 'propertyType', label: 'نوع العقار', type: 'select', required: true, options: ['شقة', 'فيلا', 'عمارة', 'مكتب تجاري'] },
          { key: 'inspectionType', label: 'نوع المعاينة', type: 'select', required: true, options: ['فحص دوري', 'تسليم مستأجر جديد', 'استلام من مستأجر', 'تقرير صيانة شامل'] },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'srv_purchase_delivery',
        code: 'purchase_delivery',
        name: 'الشراء والتوصيل اللوجستي',
        nameEn: 'Purchase & Delivery Services',
        category: 'logistics',
        description: 'شراء المستلزمات والمشتريات من المتاجر ونقل الشحنات والطرود السريعة والمبردة.',
        icon: 'Truck',
        basePrice: 35,
        pricePerKm: 1.8,
        estimatedDurationHours: 2,
        isActive: true,
        active: true,
        slaHours: 4,
        requiredFields: [
          { key: 'itemsList', label: 'قائمة المشتريات', type: 'text', required: true },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'srv_maintenance_finishing',
        code: 'maintenance_finishing',
        name: 'متابعة الصيانة والتشطيب',
        nameEn: 'Maintenance & Finishing Supervision',
        category: 'technical_services',
        description: 'إشراف هندسي وميداني على أعمال الكهرباء، السباكة، الدهانات، التشطيبات، والتوثيق بالفواتير وتقارير الإنجاز.',
        icon: 'Wrench',
        basePrice: 150,
        pricePerKm: 0,
        estimatedDurationHours: 72,
        isActive: true,
        active: true,
        slaHours: 12,
        requiredFields: [
          { key: 'workType', label: 'نوع الأعمال', type: 'select', required: true, options: ['سباكة', 'كهرباء', 'تكييف', 'دهانات وتشطيب', 'ترميم شامل'] },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'srv_express',
        code: 'express_delivery',
        name: 'توصيل سريع (Express Delivery)',
        nameEn: 'Express Courier',
        category: 'logistics',
        description: 'توصيل فوري خلال 60 دقيقة في نفس المدينة مع إثبات تسليم فوري',
        icon: 'Zap',
        basePrice: 25,
        pricePerKm: 1.5,
        estimatedDurationHours: 1,
        isActive: true,
        active: true,
        slaHours: 2,
        requiredFields: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    initialServices.forEach((s) => this.services.set(s._id, s));

    // 3. Seed Orders
    const initialOrders: IOrder[] = [
      {
        _id: 'ord_mersal_001',
        orderNumber: 'MRS-2026-9101',
        customer: 'usr_cust_001',
        service: 'srv_property_mgmt',
        serviceCode: 'property_management',
        status: 'in_progress',
        priority: 'high',
        assignedEmployee: 'usr_emp_001',
        supervisor: 'usr_sup_001',
        propertyDetails: {
          propertyType: 'villa',
          unitNumber: 'Villa-22',
          city: 'الرياض',
          district: 'الملقا',
          addressDetails: 'شارع أنس بن مالك، تقاطع طريق الخير',
          accessKeyInstructions: 'المفتاح مع حارس المجمع (أبو طارق)',
        },
        serviceDetails: {
          inspectionType: 'تقرير صيانة شامل وتسليم للمستأجر',
          roomsCount: 6,
          notes: 'التأكد من سلامة التمديدات ومضخة المياه الرئيسية والتكييف المركزي',
        },
        sender: {
          name: 'سلطان بن عبدالعزيز',
          phone: '+966555123456',
          city: 'الرياض',
          district: 'الملقا',
          addressDetails: 'شارع أنس بن مالك',
        },
        receiver: {
          name: 'إدارة أملاك مرسال',
          phone: '+966112223344',
          city: 'الرياض',
          district: 'الملقا',
          addressDetails: 'فيلا 22',
        },
        visits: [
          {
            _id: 'vst_01',
            visitDate: new Date(Date.now() - 4 * 3600000).toISOString(),
            technicianName: 'فهد المنصور',
            technicianId: 'usr_emp_001',
            purpose: 'المعاينة الهندسية وفحص لوحات الكهرباء والسباكة',
            status: 'completed',
            checkInTime: new Date(Date.now() - 4 * 3600000).toISOString(),
            checkOutTime: new Date(Date.now() - 2 * 3600000).toISOString(),
            notes: 'تم فحص جميع المكيفات، يحتاج مكيف الصالة الرئيسية إلى تعبئة فريون وتبديل فيوز',
            location: 'الرياض - حي الملقا',
          },
        ],
        tasks: [
          {
            _id: 'tsk_01',
            title: 'فحص لوحة القواطع الرئيسية',
            description: 'التأكد من عدم وجود التماس أو حرارة مرتفعة',
            isCompleted: true,
            completedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
            priority: 'high',
          },
          {
            _id: 'tsk_02',
            title: 'اختبار ضغط شبكة المياه',
            description: 'تشغيل المضخة وفحص تمديدات الحمامات والمطبخ',
            isCompleted: true,
            completedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
            priority: 'medium',
          },
          {
            _id: 'tsk_03',
            title: 'إعداد تقرير التسليم النهائي وتوثيق الصور',
            isCompleted: false,
            priority: 'high',
          },
        ],
        media: [
          {
            _id: 'med_01',
            type: 'photo',
            url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
            title: 'واجهة العقار الرئيسية قبل البدء',
            category: 'before',
            uploadedBy: 'usr_emp_001',
            uploadedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
          },
        ],
        reports: [
          {
            _id: 'rep_01',
            title: 'تقرير المعاينة الفنية الأولية للعقار',
            summary: 'حالة العقار العامة ممتازة بنسبة 92%، شبكة السباكة سليمة تماماً.',
            details: 'تم إجراء المعاينة بحضور ممثل المالك، لا يوجد أي تسريب مائي.',
            preparedBy: 'usr_emp_001',
            authorRole: 'فني أول معاينة وصيانة',
            recommendations: 'ينصح بإجراء تنظيف سنوي لخزان المياه العلوي.',
            createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
          },
        ],
        invoices: [
          {
            _id: 'inv_01',
            invoiceNumber: 'INV-2026-0041',
            subtotal: 250,
            taxAmount: 37.5,
            totalAmount: 287.5,
            items: [
              { description: 'رسوم خدمة إدارة ومعاينة العقار الشاملة', quantity: 1, unitPrice: 250, total: 250 },
            ],
            isPaid: true,
            paymentMethod: 'online',
            paidAt: new Date(Date.now() - 10 * 3600000).toISOString(),
            createdAt: new Date(Date.now() - 10 * 3600000).toISOString(),
          },
        ],
        expenses: [
          {
            _id: 'exp_01',
            title: 'شراء قاطع كهربائي إضافي 32A من شركة التوزيع',
            amount: 45,
            category: 'spare_parts',
            recordedBy: 'usr_emp_001',
            recordedAt: new Date(Date.now() - 2.5 * 3600000).toISOString(),
            approvedBy: 'usr_sup_001',
          },
        ],
        notes: [
          {
            _id: 'not_01',
            author: 'فهد المنصور',
            authorRole: 'employee',
            content: 'المالك طلب التركيز على عوازل النوافذ في الدور الثاني لمقاومة الغبار.',
            isInternalOnly: false,
            createdAt: new Date(Date.now() - 3.5 * 3600000).toISOString(),
          },
        ],
        pricing: {
          basePrice: 250,
          additionalFees: 0,
          expensesTotal: 45,
          subtotal: 295,
          tax: 44.25,
          totalAmount: 339.25,
        },
        paymentStatus: 'paid',
        timeline: [
          {
            status: 'pending',
            title: 'تم إنشاء الطلب',
            description: 'تم تقديم طلب إدارة ومعاينة العقار عبر تطبيق العميل',
            timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
            updatedBy: { id: 'usr_cust_001', name: 'سلطان بن عبدالعزيز', role: 'customer' },
            location: 'الرياض - حي الملقا',
          },
          {
            status: 'accepted',
            title: 'قبول الطلب من الإدارة',
            description: 'تمت مراجعة الطلب والموافقة على جدول الزيارة الميدانية',
            timestamp: new Date(Date.now() - 10 * 3600000).toISOString(),
            updatedBy: { id: 'usr_admin_001', name: 'سعود بن محمد', role: 'admin' },
          },
          {
            status: 'assigned',
            title: 'تعيين الفني والمشرف',
            description: 'تم إسناد الزيارة للفني فهد المنصور وإشراف م. أحمد الغامدي',
            timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
            updatedBy: { id: 'usr_sup_001', name: 'أحمد الغامدي', role: 'supervisor' },
          },
          {
            status: 'in_progress',
            title: 'بدء الزيارة الميدانية',
            description: 'الفني وصل للموقع وبدأ الفحص والتوثيق',
            timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
            updatedBy: { id: 'usr_emp_001', name: 'فهد المنصور', role: 'employee' },
            location: 'حي الملقا - شارع أنس بن مالك',
          },
        ],
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'ord_mersal_002',
        orderNumber: 'MRS-2026-9102',
        customer: 'usr_cust_002',
        service: 'srv_purchase_delivery',
        serviceCode: 'purchase_delivery',
        status: 'completed',
        priority: 'normal',
        assignedEmployee: 'usr_emp_002',
        sender: {
          name: 'صيدلية النهدي المركزية',
          phone: '+966112223344',
          city: 'الرياض',
          district: 'السليمانية',
          addressDetails: 'طريق العروبة',
        },
        receiver: {
          name: 'نورة بنت خالد آل سعود',
          phone: '+966559876543',
          city: 'الرياض',
          district: 'الياسمين',
          addressDetails: 'عمارة الياسمين، شقة 4',
        },
        serviceDetails: {
          itemsList: 'أدوية مبردة + مستلزمات رعاية طبية',
          requiresCooling: true,
          isFragile: true,
        },
        visits: [],
        tasks: [
          {
            _id: 'tsk_04',
            title: 'شراء واستلام المستلزمات الطبية في صندوق تبريد',
            isCompleted: true,
            completedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
            priority: 'urgent',
          },
          {
            _id: 'tsk_05',
            title: 'التسليم المباشر للمستلمة وتوثيق كود الإثبات POD',
            isCompleted: true,
            completedAt: new Date(Date.now() - 3.5 * 3600000).toISOString(),
            priority: 'urgent',
          },
        ],
        media: [],
        reports: [],
        invoices: [
          {
            _id: 'inv_02',
            invoiceNumber: 'INV-2026-0042',
            subtotal: 75,
            taxAmount: 11.25,
            totalAmount: 86.25,
            items: [
              { description: 'خدمة شراء ونقل سريع مع تبريد', quantity: 1, unitPrice: 75, total: 75 },
            ],
            isPaid: true,
            paymentMethod: 'online',
            paidAt: new Date(Date.now() - 6 * 3600000).toISOString(),
            createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
          },
        ],
        expenses: [],
        notes: [],
        pricing: {
          basePrice: 35,
          additionalFees: 40,
          expensesTotal: 0,
          subtotal: 75,
          tax: 11.25,
          totalAmount: 86.25,
        },
        paymentStatus: 'paid',
        timeline: [
          {
            status: 'pending',
            title: 'تم إنشاء طلب الشراء والتوصيل',
            description: 'طلب شراء ونقل طرد مبرد عاجل',
            timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
            updatedBy: { id: 'usr_cust_002', name: 'نورة بنت خالد آل سعود', role: 'customer' },
          },
          {
            status: 'completed',
            title: 'تم التسليم بنجاح (Delivered)',
            description: 'تم تسليم الطرد سليم ومبرد للمستلمة مباشرة وتوثيق إثبات التسليم POD-9921',
            timestamp: new Date(Date.now() - 3.5 * 3600000).toISOString(),
            updatedBy: { id: 'usr_emp_002', name: 'سالم الدوسري', role: 'employee' },
            location: 'الرياض - حي الياسمين',
          },
        ],
        completedAt: new Date(Date.now() - 3.5 * 3600000).toISOString(),
        createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    initialOrders.forEach((o) => this.orders.set(o._id, o));
  }

  public populateOrder(order: IOrder): any {
    const customer = typeof order.customer === 'string' ? this.users.get(order.customer) : order.customer;
    const service = typeof order.service === 'string' ? this.services.get(order.service) : order.service;
    const assignedEmployee = typeof order.assignedEmployee === 'string' ? this.users.get(order.assignedEmployee) : order.assignedEmployee;
    const supervisor = typeof order.supervisor === 'string' ? this.users.get(order.supervisor) : order.supervisor;

    return {
      ...order,
      customer: customer ? { _id: customer._id, name: customer.name, email: customer.email, phone: customer.phone } : order.customer,
      service: service || order.service,
      assignedEmployee: assignedEmployee ? { _id: assignedEmployee._id, name: assignedEmployee.name, phone: assignedEmployee.phone, employeeProfile: assignedEmployee.employeeProfile } : order.assignedEmployee,
      supervisor: supervisor ? { _id: supervisor._id, name: supervisor.name, email: supervisor.email } : order.supervisor,
    };
  }

  public addLog(log: Omit<IApiLog, '_id'>): IApiLog {
    const fullLog: IApiLog = {
      _id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...log,
    };
    this.logs.unshift(fullLog);
    if (this.logs.length > 500) {
      this.logs.pop();
    }
    return fullLog;
  }
}

export const db = new MersalDatabase();
