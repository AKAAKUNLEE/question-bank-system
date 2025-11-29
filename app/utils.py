"""工具函数模块，包含数据库操作和文件处理功能"""
import re
from flask import g

# 数据库操作函数
def query_db(query, args=(), one=False):
    """执行数据库查询"""
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv


def execute_db(query, args=()):
    """执行数据库更新操作"""
    db = get_db()
    cur = db.execute(query, args)
    db.commit()
    return cur.lastrowid



def get_db():
    """获取数据库连接"""
    return getattr(g, '_database', None)


# 文件处理函数
def allowed_file(filename):
    """检查文件类型是否允许"""
    allowed_extensions = {'txt', 'docx', 'doc', 'md'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions



def extract_questions_from_file(file_path, library_id, question_type=None):
    """从文件中提取题目并存入数据库"""
    questions = []
    current_question = None
    in_answer_section = False  # 标记当前是否在答案部分

    try:
        # 直接以文本文件打开（UTF-8编码）
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 特殊处理Markdown格式，保留空行作为分隔符
        lines = []
        for line in content.splitlines():
            # 保留空白行作为题目和答案之间的分隔符
            if line.strip() or (lines and lines[-1].strip()):
                lines.append(line.rstrip())

        # 定义答案开始标记
        answer_start_patterns = [
            '答案:', '答案：', '答:', '答：', '解析:', '解析：',
            '参考答案:', '参考答案：', '正确答案:', '正确答案：',
            '解答:', '解答：', '解：',
            # 支持Markdown格式的加粗答案标记
            '**答案:**', '**答案：**', '**答:**', '**答：**',
            '**正确答案:**', '**正确答案：**',
            # 支持前面有空格的加粗答案标记（用户示例格式）
            '    **答案:**', '    **答案：**'
        ]
        i = 0
        while i < len(lines):
            line = lines[i]

            # 检测新题目开始
            is_new_question = False

            # 只有在非答案部分才检测新题目
            if not in_answer_section:
                # 支持Markdown格式的标题、列表和常见题目格式
                # 1. 严格匹配以数字开头，后跟点、顿号、括号或空格，且后面有内容
                num_pattern_match = re.match(r'^(\d+)([\.\、\)\s])\s*([^\s].*)', line)
                # 2. 匹配括号数字格式
                bracket_match = re.match(r'^\((\d+)\)\s*([^\s].*)', line)
                # 3. 匹配中文数字格式
                chinese_num_match = re.match(r'^[一二三四五六七八九十百千]+[\.\、\)\s]\s*([^\s].*)', line)
                # 4. 题型关键词匹配
                keyword_match = any(keyword in line for keyword in [
                    '名词解释', '简答题', '论述题', '填空题',
                    '选择题', '判断题', '问答题', '单选题',
                    '多选题', '不定项选择题'
                ])
                # 5. Markdown标题行后的题目行（如### 简答题后的题目）
                is_after_heading = False
                if i > 0 and re.match(r'^#{1,6}\s+', lines[i-1]) and re.match(r'^\d+[\.\、]', line):
                    is_after_heading = True
                # 6. 匹配Markdown中的列表项格式
                markdown_list_match = re.match(r'^\s*[-\*]\s+\d+[\.\、]\s*([^\s].*)', line)
                # 7. 匹配H4标题格式的题目
                h4_heading_match = re.match(r'^####\s+([^\s].*)', line)
                # 8. 特殊处理：如果匹配到数字加点且数字较小，更可能是题目
                small_num_match = re.match(r'^\d{1,3}\.\s*', line)

                # 判断是否为新题目
                is_new_question = (num_pattern_match is not None or
                                 bracket_match is not None or
                                 chinese_num_match is not None or
                                 keyword_match or
                                 is_after_heading or
                                 markdown_list_match is not None or
                                 h4_heading_match is not None or
                                 small_num_match)

            # 如果识别到新题目
            if is_new_question:
                # 保存上一个题目
                if current_question:
                    questions.append(current_question)

                # 开始新题目
                current_question = {
                    'question': '',
                    'answer': '',
                    'question_type': '未知',
                    'difficulty': 2,
                    'library_id': library_id
                }
                in_answer_section = False  # 重置答案部分标记

                # 如果提供了统一题型，则应用到所有题目
                if question_type:
                    current_question['question_type'] = question_type
                else:
                    # 否则自动识别题目类型
                    if '名词解释' in line:
                        current_question['question_type'] = '名词解释'
                    elif '简答题' in line or '简要回答' in line or '简述' in line or '简要说明' in line:
                        current_question['question_type'] = '简答题'
                    elif '论述题' in line or '论述' in line or '详细阐述' in line:
                        current_question['question_type'] = '论述题'
                    elif '填空题' in line:
                        current_question['question_type'] = '填空题'
                    elif '选择题' in line or '单选题' in line or '多选题' in line or '不定项选择题' in line:
                        current_question['question_type'] = '选择题'
                    elif '判断题' in line:
                        current_question['question_type'] = '判断题'
                    elif '问答题' in line:
                        current_question['question_type'] = '问答题'

                # 检测同一行是否同时包含题目和答案（**答案：**标记），支持带有前导空格
                has_answer_in_same_line = False
                answer_pos = -1
                for pattern in answer_start_patterns:
                    # 搜索答案标记，不考虑前导空格
                    stripped_line = line.lstrip()
                    stripped_pattern = pattern.lstrip()
                    pos_in_stripped = stripped_line.find(stripped_pattern)
                    if pos_in_stripped != -1:
                        # 计算原始行中的实际位置
                        answer_pos = len(line) - len(stripped_line) + pos_in_stripped
                        has_answer_in_same_line = True
                        break

                # 根据不同的匹配类型处理题目内容
                if h4_heading_match:
                    # 处理H4标题格式
                    line_content = h4_heading_match.group(1)
                    if has_answer_in_same_line and answer_pos > 0:
                        current_question['question'] = line_content[:answer_pos].strip()
                        current_question['answer'] = line_content[answer_pos:].strip()
                        in_answer_section = True
                    else:
                        current_question['question'] = line_content.strip()
                else:
                    # 去掉各种格式的序号，确保保留题目内容
                    # 去掉数字加点/顿号/空格
                    line_content = re.sub(r'^\d+[\.\、\)\s]\s*', '', line)
                    # 去掉括号数字
                    line_content = re.sub(r'^\(\d+\)\s*', '', line_content)
                    # 去掉中文数字
                    line_content = re.sub(r'^[一二三四五六七八九十百千]+[\.\、\)\s]\s*', '', line_content)

                    # 处理同一行中的题目和答案
                    if has_answer_in_same_line and answer_pos > 0:
                        current_question['question'] = line_content[:answer_pos].strip()
                        current_question['answer'] = line_content[answer_pos:].strip()
                        in_answer_section = True
                    else:
                        current_question['question'] = line_content.strip()

            elif current_question:
                # 检测答案开始标记，增强Markdown格式支持

                # 检查是否是答案开始行，支持带有前导空格的答案标记
                answer_start = False
                for pattern in answer_start_patterns:
                    if line.lstrip().startswith(pattern.lstrip()):
                        answer_start = True
                        break

                # 处理不同题型的特殊规则
                if current_question['question_type'] == '名词解释':
                    # 专门针对名词解释的答案开始模式，增强Markdown加粗格式识别
                    bold_answer_start = re.search(r'(\*\*?(?:答|答案|解析|参考答案|正确答案|解答|解)\*?\*?[：:])', line)

                    if bold_answer_start:
                        # 找到答案开始标记，分割题目和答案部分
                        pos = bold_answer_start.start()
                        if pos > 0:
                            # 标记前的内容是题目补充部分
                            current_question['question'] += '\n' + line[:pos].strip()
                        # 开始答案部分
                        in_answer_section = True
                        # 去掉答案前缀，包括Markdown加粗格式
                        answer_text = re.sub(r'^\*\*?(?:答|答案|解析|参考答案|正确答案|解答|解)\*?\*?[：:]\s*', '', line)
                        # 移除所有剩余的加粗格式符号
                        answer_text = re.sub(r'\*\*', '', answer_text)
                        # 再次检查并移除可能剩余的答案前缀
                        answer_text = re.sub(r'^(?:答|答案|解析|参考答案|正确答案|解答|解)[：:]\s*', '', answer_text)
                        current_question['answer'] = answer_text.strip()
                    elif in_answer_section:
                        # 检查是否是空行，如果是空行，则结束答案部分
                        if not line.strip():
                            in_answer_section = False
                        else:
                            # 不是空行，继续添加到答案
                            current_question['answer'] += '\n' + line.strip()
                    else:
                        # 检查是否是新题目开始（避免将新题目混入当前题目）
                        # 只识别H4标题作为新题目，忽略答案中的有序列表等格式
                        potential_new_question = re.match(r'^####\s+[^\s]', line)

                        if not potential_new_question:
                            # 不是新题目，继续添加到当前题目内容
                            current_question['question'] += '\n' + line.strip()
                        else:
                            # 疑似新题目，不添加到当前题目，让下一轮循环处理
                            # 这里强制保存当前题目并重置，避免题目合并
                            questions.append(current_question)
                            # 重置当前题目和状态
                            current_question = {
                                'question': '',
                                'answer': '',
                                'question_type': '未知',
                                'difficulty': 2,
                                'library_id': library_id
                            }
                            in_answer_section = False
                            # 手动处理这一行作为新题目开始
                            i -= 1  # 让下一轮循环重新处理这一行
                elif current_question['question_type'] in ['简答题', '论述题']:
                    # 简答题和论述题特殊处理：支持图片（包括图床图片）和表格
                    # 专门针对这些题型的答案开始模式，优化匹配`**答案：**`格式
                    bold_answer_start = re.search(r'(\*\*?(?:答|答案|解析|参考答案|正确答案|解答|解)\*?\*?[：:])', line)

                    if bold_answer_start:
                        # 找到答案开始标记，分割题目和答案部分
                        pos = bold_answer_start.start()
                        if pos > 0:
                            # 标记前的内容是题目补充部分
                            current_question['question'] += '\n' + line[:pos].strip()
                        # 开始答案部分
                        in_answer_section = True
                        # 使用更强大的正则替换方法彻底清除所有可能的答案前缀
                        # 1. 首先捕获行首的缩进（如果有）
                        indent_match = re.match(r'^(\s*)', line)
                        indent = indent_match.group(1) if indent_match else ''

                        # 2. 移除所有可能的答案前缀格式（包括加粗和非加粗变体）
                        # 使用更复杂的正则表达式匹配所有可能的答案前缀格式
                        answer_text = re.sub(r'^\s*\*\*?(?:答|答案|解析|参考答案|正确答案|解答|解)\*?\*?[：:]\s*\*?\*?\s*', '', line)
                        # 再次清除任何可能剩余的前缀或残留的加粗标记
                        answer_text = re.sub(r'^(?:答|答案|解析|参考答案|正确答案|解答|解)[：:]\s*\*?\*?\s*', '', answer_text)
                        answer_text = re.sub(r'^\*\*?\s*', '', answer_text)  # 清理可能残留的加粗标记
                        # 直接保留原始格式，包括缩进和空白，以支持用户提供的格式
                        current_question['answer'] = answer_text
                    elif in_answer_section:
                        # 检查是否是空行，如果是空行，则结束答案部分
                        if not line.strip():
                            in_answer_section = False
                        else:
                            # 保留所有内容，包括图片（包括图床图片）和表格格式，完全保留原始格式和缩进
                            current_question['answer'] += '\n' + line
                            # 增强答案结束检测：检查是否遇到新题目标记
                            # 只识别H4标题作为新题目
                            potential_new_question = re.match(r'^####\s+[^\s]', line)
                            if potential_new_question:
                                # 如果在答案部分遇到新题目，保存当前题目并重置
                                questions.append(current_question)
                                # 重置当前题目和状态
                                current_question = {
                                    'question': '',
                                    'answer': '',
                                    'question_type': '未知',
                                    'difficulty': 2,
                                    'library_id': library_id
                                }
                                in_answer_section = False
                                # 手动处理这一行作为新题目开始
                                i -= 1  # 让下一轮循环重新处理这一行
                    else:
                        # 检查是否是新题目开始（避免将新题目混入当前题目）
                        # 只识别H4标题作为新题目
                        potential_new_question = re.match(r'^####\s+[^\s]', line)

                        if not potential_new_question:
                            # 不是新题目，继续添加到当前题目内容
                            # 对于简答题和论述题，保留原始格式，包括缩进
                            current_question['question'] += '\n' + line.strip()
                        else:
                            # 疑似新题目，不添加到当前题目，让下一轮循环处理
                            # 强制保存当前题目并重置，避免题目合并
                            questions.append(current_question)
                            # 重置当前题目和状态
                            current_question = {
                                'question': '',
                                'answer': '',
                                'question_type': '未知',
                                'difficulty': 2,
                                'library_id': library_id
                            }
                            in_answer_section = False
                            # 手动处理这一行作为新题目开始
                            i -= 1  # 让下一轮循环重新处理这一行
                elif answer_start:
                    # 其他题型的答案开始处理
                    in_answer_section = True
                    # 去掉答案前缀
                    answer_text = re.sub(r'^(?:答|答案|解析|参考答案|正确答案|解答|解)[：:]\s*', '', line)
                    current_question['answer'] = answer_text.rstrip()  # 保留空格以支持格式
                elif in_answer_section:
                    # 已经在答案部分，继续添加，保留格式以支持图片和表格
                    current_question['answer'] += '\n' + line.rstrip()
                else:
                    # 仍然是问题部分，继续添加到题目内容
                    current_question['question'] += '\n' + line.strip()

            i += 1

        # 保存最后一个题目
        if current_question:
            questions.append(current_question)

        # 将题目存入数据库
        saved_count = 0
        for q in questions:
            try:
                # 简化判断，只要问题不为空就尝试保存
                if q['question'].strip():
                    # 清理答案文本，增强Markdown格式支持，特别保护图床图片格式
                    if q['answer']:
                        # 只移除行首的答案前缀，保留其他所有Markdown格式（包括图片、图床图片和表格）
                        # 分割成行处理，避免影响中间内容
                        lines = q['answer'].split('\n')
                        cleaned_lines = []

                        for line in lines:
                            # 只处理行首可能的答案前缀，不改动行内内容以保护图片标签
                            cleaned_line = line
                            # 使用更强大的正则替换方法彻底清除所有可能的答案前缀
                            # 1. 首先捕获行首的缩进（如果有）
                            indent_match = re.match(r'^(\s*)', cleaned_line)
                            indent = indent_match.group(1) if indent_match else ''

                            # 2. 使用更复杂的正则表达式一次性处理所有可能的答案前缀格式
                            # 包括带缩进的、加粗的、非加粗的、重复的各种变体
                            cleaned_line = re.sub(r'^\s*\*\*?(?:答|答案|解析|参考答案|正确答案|解答|解)\*?\*?[：:]\s*\*?\*?\s*', '', cleaned_line)

                            # 3. 再次检查并清除任何可能剩余的前缀或残留的加粗标记
                            # 使用非贪婪匹配来处理可能的重复前缀
                            cleaned_line = re.sub(r'^(?:答|答案|解析|参考答案|正确答案|解答|解)[：:]\s*\*?\*?\s*', '', cleaned_line)
                            cleaned_line = re.sub(r'^\*\*?\s*', '', cleaned_line)  # 清理可能残留的加粗标记

                            # 4. 确保行首缩进被保留（如果有）
                            if indent and not cleaned_line.startswith(indent):
                                cleaned_line = indent + cleaned_line
                            # 保留原始缩进和空白，确保图床图片和表格格式完整
                            cleaned_lines.append(cleaned_line)

                        # 重新组合成文本，完全保留原始换行、缩进和格式
                        q['answer'] = '\n'.join(cleaned_lines)
                        # 对于简答题和论述题，不过度清理，保留所有格式
                        if q['question_type'] not in ['简答题', '论述题']:
                            q['answer'] = q['answer'].strip()
                    else:
                        q['answer'] = '待补充'

                    # 先检查是否存在相同题目
                    existing = query_db(
                        'SELECT id FROM questions WHERE question = ? AND library_id = ?',
                        [q['question'].strip(), library_id],
                        one=True
                    )

                    if not existing:
                        # 插入新题目
                        execute_db('''
                            INSERT INTO questions (question, answer, question_type, difficulty, library_id)
                            VALUES (?, ?, ?, ?, ?)
                        ''', [
                            q['question'].strip(),
                            q['answer'].strip(),
                            q['question_type'],
                            q['difficulty'],
                            library_id
                        ])
                        saved_count += 1
            except Exception as e:
                print(f"保存题目失败: {e}")

        return saved_count, len(questions)

    except Exception as e:
        print(f"解析文件失败: {e}")
        return 0, 0