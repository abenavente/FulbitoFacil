require 'test_helper'

class TarifasControllerTest < ActionController::TestCase
  setup do
    @tarifa = tarifas(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:tarifas)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create tarifa" do
    assert_difference('Tarifa.count') do
      post :create, tarifa: @tarifa.attributes
    end

    assert_redirected_to tarifa_path(assigns(:tarifa))
  end

  test "should show tarifa" do
    get :show, id: @tarifa
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @tarifa
    assert_response :success
  end

  test "should update tarifa" do
    put :update, id: @tarifa, tarifa: @tarifa.attributes
    assert_redirected_to tarifa_path(assigns(:tarifa))
  end

  test "should destroy tarifa" do
    assert_difference('Tarifa.count', -1) do
      delete :destroy, id: @tarifa
    end

    assert_redirected_to tarifas_path
  end
end
