# -*- coding: utf-8 -*-
"""
题库管理系统应用初始化
"""
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from config import config

# 初始化数据库
db = SQLAlchemy()

# 初始化登录管理器
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.login_message_category = 'info'


def create_app(config_name=None):
    """创建应用实例"""
    if config_name is None:
        config_name = os.environ.get('FLASK_CONFIG', 'default')
    
    # 创建Flask应用
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # 初始化扩展
    config[config_name].init_app(app)
    db.init_app(app)
    login_manager.init_app(app)
    
    # 确保上传目录存在
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # 注册蓝图
    from . import auth
    app.register_blueprint(auth.bp)
    
    from . import routes
    app.register_blueprint(routes.main_bp)
    app.register_blueprint(routes.library_bp)
    app.register_blueprint(routes.question_bp)
    app.register_blueprint(routes.paper_bp)
    
    return app