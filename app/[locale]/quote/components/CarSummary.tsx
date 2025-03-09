import React from 'react';

// 定义组件Props接口
interface VehicleCardProps {
  make: any;
  model: any;
  year?: number|null;
  type?: string;
  makes: Array<{id: number; name: string}>;
  models: Array<{id: number; name: string}>;
  vehicleUses: Array<{id: string; label: string}>;
  primaryUse?: string;
  annualMileage?: number;
  parking?: string;
  antiTheft?: boolean;
  winterTires?: boolean;
  t: (key: string) => string; // 国际化翻译函数
}

// 车辆卡片组件
const VehicleCard: React.FC<VehicleCardProps> = ({
  make,
  model,
  year,
  type,
  makes,
  models,
  vehicleUses,
  primaryUse,
  annualMileage,
  parking,
  antiTheft,
  winterTires,
  t
}) => {
  // 根据车型类型获取对应的简化SVG图标
  const getVehicleSvg = (vehicleType?: string) => {
    const typeStr = (vehicleType || '').toLowerCase();
    
    // SUV类型 - 更高更短的车身
    if (typeStr.includes('suv') || typeStr.includes('crossover')) {
      return (
        <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="15" width="60" height="25" stroke="currentColor" strokeWidth="2" fill="none" rx="3" />
          <line x1="20" y1="30" x2="80" y2="30" stroke="currentColor" strokeWidth="2" />
          <circle cx="30" cy="45" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="70" cy="45" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
          <line x1="35" y1="15" x2="40" y2="5" stroke="currentColor" strokeWidth="2" />
          <line x1="65" y1="15" x2="60" y2="5" stroke="currentColor" strokeWidth="2" />
          <line x1="40" y1="5" x2="60" y2="5" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    }
    
    // 卡车类型 - 带有车斗
    else if (typeStr.includes('truck') || typeStr.includes('pickup')) {
      return (
        <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="15" y="15" width="30" height="20" stroke="currentColor" strokeWidth="2" fill="none" rx="2" />
          <rect x="45" y="20" width="40" height="15" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="25" cy="45" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="75" cy="45" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
          <line x1="15" y1="35" x2="85" y2="35" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    }
    
    // 轿车类型 - 简化版本
    else {
      return (
        <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20,35 L25,20 L75,20 L80,35" stroke="currentColor" strokeWidth="2" fill="none" />
          <line x1="20" y1="35" x2="80" y2="35" stroke="currentColor" strokeWidth="2" />
          <rect x="30" y="20" width="40" height="15" stroke="currentColor" strokeWidth="1" fill="none" />
          <circle cx="30" cy="45" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="70" cy="45" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      );
    }
  };

  // 获取品牌和型号名称
  const makeName = makes.find(m => m.id === make)?.name || '';
  const modelName = models.find(m => m.id === model)?.name || '';
  
  // 获取使用用途名称
  const primaryUseLabel = vehicleUses.find(u => u.id === primaryUse)?.label || '';
  
  return (
    <div className="mt-2mb-2 bg-blue-350 rounded-lg border-2 border-primary-200 overflow-hidden">
      {/* 车辆标题区域 */}
      <div className="p-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {makeName} {modelName}
        </h2>
        
        {/* 标签栏 */}
        <div className="flex justify-center flex-wrap gap-2 mt-3">
          {year && (
            <span className="bg-blue-100 text-blue-800 rounded-md px-4 py-1 text-sm font-medium">
              {year}
            </span>
          )}
          
          {type && (
            <span className="bg-purple-100 text-purple-800 rounded-md px-4 py-1 text-sm font-medium">
              {type}
            </span>
          )}
          
          {primaryUseLabel && (
            <span className="bg-green-100 text-green-800 rounded-md px-4 py-1 text-sm font-medium">
              {primaryUseLabel}
            </span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* 左侧: 车辆详细信息 */}
        <div className="space-y-4">
          {/* 停车信息 */}
          {parking && (
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <i className="pi pi-home text-blue-600 text-xl"></i>
              </div>
              <div>
                <span className="text-sm text-gray-500 block">
                  {t('vehicle_info.parking')}
                </span>
                <span className="text-base font-medium text-gray-800">
                  {t(`vehicle_info.${parking}`) || 'Not specified'}
                </span>
              </div>
            </div>
          )}
          
          {/* 年行驶里程 */}
          {annualMileage && (
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <i className="pi pi-chart-line text-blue-600 text-xl"></i>
              </div>
              <div>
                <span className="text-sm text-gray-500 block">
                  {t('vehicle_info.annual_mileage')}
                </span>
                <span className="text-base font-medium text-gray-800">
                  {annualMileage.toLocaleString()} km
                </span>
              </div>
            </div>
          )}
          
          {/* 车辆特性标签 */}
          <div className="flex flex-wrap gap-2 mt-3">
            {antiTheft && (
              <span className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs flex items-center">
                <i className="pi pi-lock mr-1"></i>
                {t('vehicle_info.anti_theft')}
              </span>
            )}
            
            {winterTires && (
              <span className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs flex items-center">
                <i className="pi pi-cloud-snow mr-1"></i>
                {t('vehicle_info.winter_tires')}
              </span>
            )}
          </div>
        </div>
        
        {/* 右侧: 车辆图标 */}
        <div className="flex flex-col items-center justify-center">
          <div className="car-icon text-blue-500 mb-3">
            {getVehicleSvg(type)}
          </div>
          
          <span className="text-lg font-medium text-gray-700">
            {makeName} {modelName}
          </span>
        </div>
      </div>
      
      {/* 添加动画样式 */}
      <style jsx>{`
        .car-icon {
          transition: transform 0.3s ease;
        }
        
        .car-icon:hover {
          transform: translateY(-5px);
        }
        
        @keyframes wheel-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .car-icon:hover circle {
          animation: wheel-spin 2s linear infinite;
          transform-origin: center;
          transform-box: fill-box;
        }
      `}</style>
    </div>
  );
};

export default VehicleCard;