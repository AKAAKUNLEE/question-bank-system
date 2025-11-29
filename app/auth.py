# -*- coding: utf-8 -*-
"""
用户认证模块
"""
import sqlite3
import os
from flask import Blueprint, render_template, redirect, url_for, request, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, login_required, current_user
from app import login_manager

# 创建蓝图
bp = Blueprint('auth', __name__, url_prefix='/auth')


class User:
    """用户类"""
    def __init__(self, id, username, password, email, role_id):
        self.id = id
        self.username = username
        self.password = password
        self.email = email
        self.role_id = role_id
        self.is_authenticated = True
        self.is_active = True
        self.is_anonymous = False
    
    def get_id(self):
        return str(self.id)
    
    @property
    def is_admin(self):
        return self.role_id == 1


def get_db():
    """获取数据库连接"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'app.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def query_db(query, args=(), one=False):
    """执行查询并返回结果"""
    conn = get_db()
    cur = conn.execute(query, args)
    rv = cur.fetchall()
    conn.close()
    return (rv[0] if rv else None) if one else rv


def execute_db(query, args=()):
    """执行SQL语句"""
    conn = get_db()
    conn.execute(query, args)
    conn.commit()
    conn.close()


@login_manager.user_loader
def load_user(user_id):
    """加载用户"""
    user = query_db('SELECT * FROM users WHERE id = ?', [user_id], one=True)
    if user:
        return User(user['id'], user['username'], user['password'], user['email'], user['role_id'])
    return None


def check_user_exists(username, email):
    """检查用户是否存在"""
    user = query_db('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], one=True)
    return user is not None


@bp.route('/login', methods=['GET', 'POST'])
def login():
    """登录路由"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # 查询用户
        user = query_db('SELECT * FROM users WHERE username = ?', [username], one=True)
        
        if user and check_password_hash(user['password'], password):
            # 创建用户对象
            user_obj = User(user['id'], user['username'], user['password'], user['email'], user['role_id'])
            
            # 登录用户
            login_user(user_obj)
            
            # 保存用户信息到会话
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['role_id'] = user['role_id']
            
            flash('登录成功！', 'success')
            return redirect(url_for('main.index'))
        else:
            flash('用户名或密码错误！', 'danger')
    
    return render_template('login.html')


@bp.route('/register', methods=['GET', 'POST'])
def register():
    """注册路由"""
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        # 验证表单
        if not username or not email or not password:
            flash('请填写所有必填字段！', 'danger')
            return redirect(url_for('auth.register'))
        
        if password != confirm_password:
            flash('两次输入的密码不一致！', 'danger')
            return redirect(url_for('auth.register'))
        
        # 检查用户是否已存在
        if check_user_exists(username, email):
            flash('用户名或邮箱已被注册！', 'danger')
            return redirect(url_for('auth.register'))
        
        # 创建新用户
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        execute_db(
            'INSERT INTO users (username, password, email, role_id) VALUES (?, ?, ?, ?)',
            [username, hashed_password, email, 2]  # 默认角色为普通用户
        )
        
        flash('注册成功！请登录。', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('register.html')


@bp.route('/logout')
@login_required
def logout():
    """登出路由"""
    logout_user()
    
    # 清除会话
    session.pop('user_id', None)
    session.pop('username', None)
    session.pop('role_id', None)
    
    flash('已成功登出！', 'success')
    return redirect(url_for('auth.login'))


@bp.route('/profile')
@login_required
def profile():
    """用户资料路由"""
    return render_template('profile.html', user=current_user)


def admin_required(f):
    """管理员权限装饰器"""
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.is_admin:
            flash('您没有权限访问此页面！', 'danger')
            return redirect(url_for('main.index'))
        return f(*args, **kwargs)
    return decorated_function