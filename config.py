# -*- coding: utf-8 -*-
"""
配置文件
"""
import os

class Config:
    """基础配置类"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads')
    ALLOWED_EXTENSIONS = {'txt', 'md', 'docx'}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    
    # 题目类型配置
    QUESTION_TYPES = {
        'single_choice': '单选题',
        'multiple_choice': '多选题',
        'true_false': '判断题',
        'short_answer': '简答题',
        'essay': '论述题'
    }
    
    # 题目难度配置
    QUESTION_DIFFICULTIES = {
        'easy': '简单',
        'medium': '中等',
        'hard': '困难'
    }

class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True

class TestingConfig(Config):
    """测试环境配置"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'test.db')

class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False
    # 生产环境应该使用更安全的数据库配置
    # SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')

# 配置映射
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}